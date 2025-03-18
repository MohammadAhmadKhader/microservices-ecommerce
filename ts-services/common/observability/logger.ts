import winston from "winston"
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { catchError, map, Observable } from "rxjs"
import { Metadata } from "@grpc/grpc-js"
import { getMethodAndServiceNameFromArgs } from '../utils';
import { trace, context as telemtryContext } from "@opentelemetry/api";

const logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
)

export const logger = winston.createLogger({
    level:"info",
    format: logFormat,
    transports:[
        new winston.transports.Console(),
        new winston.transports.File({filename :"error.log", level:"error"}),
        new winston.transports.File({filename: "combined.log" })
    ]
})

/**
 * use this function only when there is a function that you wish to log its params and result, 
 * usually service methods that called directly from the controller handlers are logged using @LoggingInterceptor
 * @see {@link LoggingInterceptor}
 * @param redactedData a function that will return the redacted params so they will be logged
 */
export function MethodLogger(redactedData: () => any[] = undefined) {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const method = descriptor.value

        descriptor.value = async function(...args:any[]) {
            try {
                let newArgs:any[] | undefined
                if(redactedData) {
                    newArgs = redactedData()
                }
                
                logger.info(`${propertyKey} method`, { args: newArgs || args })
                const result = await method.apply(this, newArgs || args)

                logger.info(`received: ${result}`)
                return result 
            } catch (error : any) {
                logger.error(error.message)
                throw error
            }
        }

        return descriptor
    }
}

export function redactSensitiveData(data: any, sensitiveKeys: string[]) {
    const redactedClone = structuredClone(data)
    for(const key of sensitiveKeys) {
        if(redactedClone[key] !== undefined) {
            redactedClone[key] = "[REDACTED]"
        }

        if(redactedClone["user"] && redactedClone["user"].password) {
            redactedClone.user.password = "[REDACTED]"
        }
    }

    return redactedClone
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly redactedKeys: string[] = []) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const args = context.getArgs();
    const redactedData = redactSensitiveData(args[0], this.redactedKeys)

    const {trace , traceparent} = getCurrTraceAndTraceParent(context) || { trace: 'Unknown', traceparent: 'Unknown' }
    const {serviceName, methodName} = getMethodAndServiceNameFromArgs(context.getArgs())
    const start = performance.now()

    logger.info(`service call started`, { 
        args: redactedData || args,
        service: serviceName,
        method: methodName,
        traceparent,
        trace,
        durationMs: getDurationMS(start)
     })
    
    return next.handle().pipe(
      map((res)=>{
        let loggedRes: any
        if(this.redactedKeys.length > 0) {
            loggedRes = redactSensitiveData(structuredClone(res), this.redactedKeys)
        } else {
            loggedRes = res
        }

        logger.info(`service call ended`, {
            result: loggedRes || {},
            service: serviceName,
            method: methodName,
            traceparent,
            trace,
            durationMs: getDurationMS(start)
        })

        return res
      }),
      catchError((error) => {
        logger.error("error occured", {
            service: serviceName,
            method: methodName,
            error: error.stack,
            message: error.message,
            trace,
            traceparent
        })
        throw error
      })
    )
  }
}

function getCurrTraceAndTraceParent(ctx: ExecutionContext) {
    const metadata = ctx.switchToRpc().getContext() as Metadata
    const traceparent = metadata.get('traceparent')?.[0]
    const activeSpan = trace.getSpan(telemtryContext.active());
    const currentTrace = activeSpan?.spanContext().traceId;

    return { traceparent, trace: currentTrace}
}

function getDurationMS(start: number) {
    return (performance.now() - start).toFixed(2)
}