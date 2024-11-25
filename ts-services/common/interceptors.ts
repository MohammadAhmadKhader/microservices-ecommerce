import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { MetricsService } from "./modules/metrics/metrics.service";
import { Observable } from "rxjs";


@Injectable()
export class MetricsInterceptor implements NestInterceptor {
    constructor(private readonly metricsService: MetricsService) {}

    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
        const handler = context.getHandler()
        const method = handler.name
        
        this.metricsService.incrementCounter()

        return next.handle().pipe()
    }
}