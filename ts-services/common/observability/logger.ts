import winston from "winston"
import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor, Logger } from "@nestjs/common"
import { catchError, finalize, map, Observable } from "rxjs"
import { Metadata } from "@grpc/grpc-js"
import { Reflector } from "@nestjs/core"

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
    }

    return redactedClone
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    @Inject(Logger)
    private logger: Logger
  constructor(private readonly redactedKeys: string[] = []) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const args = context.getArgs();
    const metadata = context.switchToRpc().getContext() as Metadata

    const traceparent = metadata.get('traceparent')?.[0]
    const redactedData = redactSensitiveData(args[0], this.redactedKeys)

    console.log(redactedData, {traceparent})
    console.log(this.logger)
    logger.info(`${context.getHandler()} method`, { args: redactedData || args })

    return next.handle().pipe(
      map((res)=>{
        logger.info(`received: ${res}`)
        return res
      }),
      catchError((error) => {
        logger.error(error.message)
        throw error
      })
    )
  }
}
