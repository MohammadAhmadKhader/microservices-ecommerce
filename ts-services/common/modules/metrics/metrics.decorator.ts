import { MetricsService } from './metrics.service';
import {status as grpcStatus} from "@grpc/grpc-js"

/**
 * You must import MetricsModule to be able to use this decorator
 * @param serviceName your service name
 * @param methodName grpc method (must use the controller method)
 * 
 */
export function CreateMetricsDecorator(serviceName: string, getMetricService: ()=> MetricsService) {
  return function(methodName: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value;

      descriptor.value = async function (...args: any[]) {
        const metricsService = getMetricService()
        const startTime = performance.now();
        let statusCode = grpcStatus[grpcStatus.OK]
        
        try {
          const result = await originalMethod.apply(this, args);
          return result
        } catch (error) {

          statusCode = error?.code ? grpcStatus[error.code] : grpcStatus[grpcStatus.UNKNOWN]
          throw error
        } finally {
          const durationInSeconds = (performance.now() - startTime) / 1000;

          metricsService.incrementCounter(serviceName, methodName, statusCode);
          metricsService.observeDuration(serviceName, methodName, durationInSeconds);
        }
      };

      return descriptor;
    };
  }
}