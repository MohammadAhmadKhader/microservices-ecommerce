import { MetricsModule } from '@ms/common/modules/metrics/metrics.module';
import { MetricsService } from '@ms/common/modules/metrics/metrics.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { ConsulService } from '@ms/common/modules/registry/registry.service';
import {v4 as uuid} from "uuid"

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    MetricsModule.register(new MetricsService({
      name:"products_service_calls_counter",
      help:"products service calls counters",
    })),
  ],
  controllers: [ProductsController],
  providers: [ProductsService,
  {
    provide: ConsulService,
    useFactory:()=>{
      const serviceId = uuid()
      return new ConsulService({
        serviceId: serviceId,
        serviceName: "products",
        serviceHost: process.env.SERVICE_HOST,
        servicePort: Number(process.env.SERVICE_PORT), 
        checkName:"products-check",
        timeout:"1s",
        deregisterCriticalServiceAfter:"5s",
        checkGrpcHost:`${process.env.SERVICE_HOST}:${Number(process.env.SERVICE_PORT)}`,
        interval:"10s",
        checkId: serviceId,
      })
    }
  }
],
})
export class ProductsModule {}