import { MetricsModule } from '@ms/common/modules/metrics/metrics.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { ConsulService } from '@ms/common/modules/registry/registry.service';
import {v4 as uuid} from "uuid"
import ServiceConfig from './products.config';

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
]})
export class ProductsModule {}