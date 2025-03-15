import { PrometheusModule,  } from '@willsoto/nestjs-prometheus';
import { Module } from "@nestjs/common";
import { MetricsService } from "./metrics.service";

@Module({
    imports:[PrometheusModule.register()],
    providers:[MetricsService],
    exports:[MetricsService]
})
export class MetricsModule {}