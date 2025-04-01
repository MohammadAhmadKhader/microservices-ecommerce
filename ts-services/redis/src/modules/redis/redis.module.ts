import { Module } from '@nestjs/common';
import { RedisController, RedisServiceName } from './redis.controller';
import { RedisService } from './redis.service';
import { ConfigModule } from '@nestjs/config';
import { Redis } from 'ioredis';
import {v4 as uuid} from "uuid"
import { TraceModule } from './redis.telemetry';
import ServiceConfig from '@src/config/config';
import { LoggingService, MetricsModule, HealthModule, ConsulService } from '@ms/common';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TraceModule,
    HealthModule,
    MetricsModule],
  controllers: [RedisController],
  providers: [RedisService, {
    provide:"REDIS_CLIENT",
    useFactory:() => {
      const serviceConfig = ServiceConfig()
      const redis = new Redis({
        host: serviceConfig.redisHost,
        port: serviceConfig.redisPort,
        password: serviceConfig.redisPassword,
        db:0
      })
      return redis
    }
  },{
    provide:ConsulService,
    useFactory: async ()=>{ 
      const serviceId = uuid()
      const serviceConfig = ServiceConfig()
      return new ConsulService({
        serviceId: serviceId,
        serviceName: 'redis',
        serviceHost: serviceConfig.serviceHost,
        servicePort: serviceConfig.servicePort, 
        checkName:"redis-check",
        timeout:"1s",
        deregisterCriticalServiceAfter:"5s",
        checkGrpcHost: serviceConfig.serviceUrl,
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
        service: RedisServiceName,
        username:"",
        password:"",
        isProduction: serviceConfig.isProduction,
        logstashHost: serviceConfig.logstashHost,
        logstashPort: serviceConfig.logstashPort,
      })
    }
  }],
})
export class RedisModule {}
