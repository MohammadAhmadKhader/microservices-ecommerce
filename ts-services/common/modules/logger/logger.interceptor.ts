import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor, OnModuleInit } from "@nestjs/common"
import { catchError, map, Observable } from "rxjs"
import { Metadata } from "@grpc/grpc-js"
import { getMethodAndServiceNameFromArgs } from '../../utils';
import { trace, context as telemtryContext } from "@opentelemetry/api";
import { LoggingService } from "./logger.service";
import { Reflector } from "@nestjs/core";

function redactSensitiveData(data: any, sensitiveKeys: string[]) {
    if(sensitiveKeys.length === 0) {
        return null
    }

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

export const RedactKeys = Reflector.createDecorator<string[]>()

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggingService, private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const args = context.getArgs();
    const redactedKeys = this.reflector.get(RedactKeys, context.getHandler()) || []
    const redactedData = redactSensitiveData(args[0], redactedKeys)

    const {trace , traceparent} = getCurrTraceAndTraceParent(context)
    const {serviceName, methodName} = getMethodAndServiceNameFromArgs(context.getArgs())
    const start = performance.now()

    this.logger.info(`service call started`, { 
        args: redactedData || args[0],
        method: methodName,
        traceparent,
        trace
    })
    
    return next.handle().pipe(
      map((res)=>{
        let loggedRes: any
        if(redactedKeys.length > 0) {
            loggedRes = redactSensitiveData(structuredClone(res), redactedKeys)
        } else {
            loggedRes = res
        }

        this.logger.info(`service call ended`, {
            result: loggedRes || {},
            method: methodName,
            traceparent,
            trace,
            durationMs: getDurationMS(start)
        })

        return res
      }),
      catchError((error) => {
        this.logger.error("error occured", {
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
    const traceparent = metadata.get('traceparent')?.[0] || null
    const activeSpan = trace.getSpan(telemtryContext.active());
    const currentTrace = activeSpan?.spanContext().traceId;

    return { traceparent, trace: currentTrace || null }
}

function getDurationMS(start: number) {
    return (performance.now() - start).toFixed(2)
}