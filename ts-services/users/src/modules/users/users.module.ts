import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController, UsersServiceName } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ConsulService, LoggingService, MetricsModule, LoggingInterceptor} from '@ms/common/modules/index';
import {v4 as uuid} from "uuid"
import { ConfigModule } from '@nestjs/config';
import ServiceConfig from "@src/config/config"

@Module({
  imports:[
    ConfigModule.forRoot({
      load:[ServiceConfig]
    }),
    MetricsModule,
    TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [
    UsersService, 
    {
    provide: ConsulService,
    useFactory:()=>{
      const serviceId = uuid()
      return new ConsulService({
        serviceId: serviceId,
        serviceName: "users",
        serviceHost: process.env.SERVICE_HOST,
        servicePort: Number(process.env.SERVICE_PORT), 
        checkName:"users-check",
        timeout:"1s",
        deregisterCriticalServiceAfter:"5s",
        checkGrpcHost:`${process.env.SERVICE_HOST}:${Number(process.env.SERVICE_PORT)}`,
        interval:"10s",
        checkId: serviceId,
      })
    }
    },
    {
      provide:LoggingService,
      useFactory: () => {
        const serviceConfig = ServiceConfig()
        return new LoggingService({
          service: UsersServiceName,
          username:"",
          password:"",
          isProduction: serviceConfig.isProduction,
          logstashHost: serviceConfig.logstashHost,
          logstashPort: serviceConfig.logstashPort,
        })
      }
    },
    {
      provide: 'REDACTED_KEYS',
      useValue: ["password"],
    },
    {
      provide: LoggingInterceptor,
      useFactory: (loggingService: LoggingService, redactedKeys: string[]) => {
        return new LoggingInterceptor(loggingService, redactedKeys);
      },
      inject: [LoggingService, 'REDACTED_KEYS'],
    }],
  exports:[UsersService]
})
export class UsersModule {}
