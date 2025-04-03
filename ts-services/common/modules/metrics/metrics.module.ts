import { PrometheusModule,  } from '@willsoto/nestjs-prometheus';
import { Global, Module } from "@nestjs/common";
import { MetricsService } from "./metrics.service";

@Global()
@Module({
    imports:[PrometheusModule.register()],
    providers:[MetricsService],
    exports:[MetricsService]
})
export class MetricsModule {}