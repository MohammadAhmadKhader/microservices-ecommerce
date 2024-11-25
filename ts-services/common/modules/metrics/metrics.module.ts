import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { DynamicModule, Module } from "@nestjs/common";
import { MetricsService } from "./metrics.service";
import { MetricsController } from "./metrics.controller";

@Module({
    imports:[PrometheusModule.register()],
    controllers:[MetricsController],
    providers:[MetricsService],
    exports:[MetricsService]
})
export class MetricsModule{
    static register(customMetricsService: MetricsService): DynamicModule {
        return {
            module:MetricsModule,
            providers:[{
                provide:MetricsService,
                useFactory:()=>{
                    return customMetricsService
                }
            }],
            exports:[MetricsService]
        }
    }
}