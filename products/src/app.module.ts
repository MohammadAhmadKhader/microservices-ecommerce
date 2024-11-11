import { Injectable, Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './common-ts/modules/health/health.module';
import { ConsulService} from './common-ts/modules/registry/registry.service';
import {v4 as uuid} from "uuid"

@Module({
  imports: [
    ProductsModule, 
    HealthModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type:"mysql",
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: Number(process.env.DB_PORT),
      host: process.env.DB_HOST,
      autoLoadEntities:true,
      logging:true,
      synchronize:true,
    })
  ],
  providers:[{
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
  }]
})
export class AppModule {}
