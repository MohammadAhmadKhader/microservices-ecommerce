import { MetricsModule } from '@ms/common/modules/metrics/metrics.module';
import { MetricsService } from '@ms/common/modules/metrics/metrics.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module, OnModuleInit, SetMetadata } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { ConsulService } from '@ms/common/modules/registry/registry.service';
import {v4 as uuid} from "uuid"
import ServiceConfig from './products.config';

export const appServicesMap = new Map<string, any>()

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    MetricsModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService,
  {
    provide: ConsulService,
    useFactory:()=>{
      const serviceId = uuid()
      const serviceConfig = ServiceConfig()
      return new ConsulService({
        serviceId: serviceId,
        serviceName: "products",
        serviceHost: serviceConfig.serviceHost,
        servicePort: serviceConfig.servicePort, 
        checkName:"products-check",
        timeout:"1s",
        deregisterCriticalServiceAfter:"5s",
        checkGrpcHost: serviceConfig.serviceUrl,
        interval:"10s",
        checkId: serviceId,
      })
    }
  }
],
})
export class ProductsModule implements OnModuleInit{
  constructor(private readonly metricsService: MetricsService) {

  }
  onModuleInit() {
    appServicesMap.set(MetricsService.name, this.metricsService)
  }
}