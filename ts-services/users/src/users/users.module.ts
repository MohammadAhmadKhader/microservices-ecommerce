import { Module, OnModuleInit } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ConsulService } from '@ms/common/modules/registry/registry.service';
import {v4 as uuid} from "uuid"
import { ConfigModule } from '@nestjs/config';
import ServiceConfig from "./users.config"
import { MetricsModule } from '@ms/common/modules/metrics/metrics.module';
import { MetricsService } from '@ms/common/modules/metrics/metrics.service';

export const appServicesMap = new Map<string, any>()

@Module({
  imports:[
    ConfigModule.forRoot({
      load:[ServiceConfig]
    }),
    MetricsModule,
    TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService, {
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
  }],
  exports:[UsersService]
})
export class UsersModule implements OnModuleInit{
  constructor(private readonly metricsService: MetricsService) {

  }

  onModuleInit() {
    appServicesMap.set(MetricsService.name, this.metricsService)
  }
}
