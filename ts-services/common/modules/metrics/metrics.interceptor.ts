import { ServerWritableStreamImpl } from '@grpc/grpc-js/build/src/server-call';
import { MetricsService } from './metrics.service';
import {status as grpcStatus} from "@grpc/grpc-js"
import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common';
import { catchError, finalize, Observable } from 'rxjs';

@Injectable()
export class GrpcMetricsInterceptor implements NestInterceptor {
  @Inject(MetricsService)
  private readonly metricsService: MetricsService
  constructor() {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const args = context.getArgs();
    const {methodName, serviceName} = getMethodAndServiceName(args)
    
    const startTime = performance.now();
    let statusCode = grpcStatus[grpcStatus.OK]
    
    return next.handle().pipe(
      catchError((error) => {
        statusCode = error?.code ? grpcStatus[error.code] : grpcStatus[grpcStatus.UNKNOWN]
        throw error
      }),
      finalize(() => {
        const durationInSeconds = (performance.now() - startTime) / 1000;

        this.metricsService.incrementCounter(serviceName, methodName, statusCode);
        this.metricsService.observeDuration(serviceName, methodName, durationInSeconds);
      })
    )
  }
}


function getMethodAndServiceName(args: any[]) {
  const serviceWritableStreamImpl = args[2] as ServerWritableStreamImpl<any, any>
  const path = serviceWritableStreamImpl.getPath()
  const splittedPath = path.split("/")
  const methodName = splittedPath[splittedPath.length - 1]
  const serviceName = splittedPath[splittedPath.length - 2].split(".")[1]

  return {
    methodName,
    serviceName
  }
}