import { Module, OnModuleInit } from '@nestjs/common';
import { RedisController } from './redis.controller';
import { RedisService } from './redis.service';
import { ConfigModule } from '@nestjs/config';
import { Redis } from 'ioredis';
import { HealthModule } from '@ms/common/modules/health/health.module';
import { ConsulService } from '@ms/common/modules/registry/registry.service';
import {v4 as uuid} from "uuid"
import { TraceModule } from './telemetry';
import ServiceConfig from './redis.config';
import { MetricsModule } from '@ms/common/modules/metrics/metrics.module';

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
  }],
})
export class RedisModule {}
