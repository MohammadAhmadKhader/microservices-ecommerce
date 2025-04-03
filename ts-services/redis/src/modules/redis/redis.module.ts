import { Module } from '@nestjs/common';
import { RedisController, RedisServiceName } from './redis.controller';
import { RedisService } from './redis.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import {v4 as uuid} from "uuid"
import { TraceModule } from './redis.telemetry';
import ServiceConfig, { INJECTION_TOKEN, ServiceConfig as TServiceConfig } from '@src/config/config';
import { LoggingService, MetricsModule, HealthModule, ConsulService } from '@ms/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load:[ServiceConfig]
    }),
    TraceModule,
    HealthModule,
    MetricsModule],
  controllers: [RedisController],
  providers: [RedisService, {
    provide:"REDIS_CLIENT",
    inject:[ConfigService],
    useFactory:(configService: ConfigService) => {
      const cfg = configService.get<TServiceConfig>(INJECTION_TOKEN)
      const redis = new Redis({
        host: cfg.redisHost,
        port: cfg.redisPort,
        password: cfg.redisPassword,
        db:0
      })

      return redis
    }
  },{
    provide:ConsulService,
    inject:[ConfigService],
    useFactory: async (configService: ConfigService)=>{ 
      const serviceId = uuid()
      const cfg = configService.get<TServiceConfig>(INJECTION_TOKEN)

      return new ConsulService({
        serviceId: serviceId,
        serviceName: 'redis',
        serviceHost: cfg.serviceHost,
        servicePort: cfg.servicePort, 
        checkName:"redis-check",
        timeout:"1s",
        deregisterCriticalServiceAfter:"5s",
        checkGrpcHost: cfg.serviceUrl,
        interval:"10s",
        checkId: serviceId,
      })
    }
  },
  {
    provide:LoggingService,
    inject:[ConfigService],
    useFactory: (configService: ConfigService) => {
      const cfg = configService.get<TServiceConfig>(INJECTION_TOKEN)

      return new LoggingService({
        service: RedisServiceName,
        username:"",
        password:"",
        isProduction: cfg.isProduction,
        logstashHost: cfg.logstashHost,
        logstashPort: cfg.logstashPort,
      })
    }
  }],
})
export class RedisModule {}
