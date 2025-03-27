import { MetricsService } from './metrics.service';
import {status as grpcStatus} from "@grpc/grpc-js"
import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common';
import { catchError, finalize, Observable } from 'rxjs';
import { getMethodAndServiceNameFromArgs } from '../../utils';

@Injectable()
export class GrpcMetricsInterceptor implements NestInterceptor {
  @Inject(MetricsService)
  private readonly metricsService: MetricsService
  constructor() {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const args = context.getArgs();
    const {methodName, serviceName} = getMethodAndServiceNameFromArgs(args)

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