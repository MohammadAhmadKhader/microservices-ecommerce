import { MetricsModule, LoggingService, ConsulService, LoggingInterceptor } from '@ms/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController, ProductService } from './products.controller';
import { Product } from './entities/product.entity';
import {v4 as uuid} from "uuid"
import ServiceConfig from '@src/config/config';
import { ProductTelemetrySubscriber } from './products.telemetry';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load:[ServiceConfig]
    }),
    TypeOrmModule.forFeature([Product]),
    MetricsModule,
  ],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    ProductTelemetrySubscriber,
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
  },{
    provide:LoggingService,
    useFactory: () => {
      const serviceConfig = ServiceConfig()
      return new LoggingService({
        service: ProductService,
        username:"",
        password:"",
        isProduction: serviceConfig.isProduction,
        logstashHost: serviceConfig.logstashHost,
        logstashPort: serviceConfig.logstashPort,
      })
    }
  },{
    provide: 'REDACTED_KEYS',
    useValue: [],
  },
  {
    provide: LoggingInterceptor,
    useFactory: (loggingService: LoggingService, redactedKeys: string[]) => {
      return new LoggingInterceptor(loggingService, redactedKeys);
    },
    inject: [LoggingService, 'REDACTED_KEYS'],
  }
]})
export class ProductsModule {}