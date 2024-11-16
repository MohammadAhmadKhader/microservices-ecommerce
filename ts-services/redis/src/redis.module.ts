import { Module } from '@nestjs/common';
import { RedisController } from './redis.controller';
import { RedisService } from './redis.service';
import { ConfigModule } from '@nestjs/config';
import { Redis } from 'ioredis';
import { HealthModule } from '@ms/common/modules/health/health.module';
import { ConsulService } from '@ms/common/modules/registry/registry.service';
import {v4 as uuid} from "uuid"

@Module({
  imports: [ConfigModule.forRoot(),HealthModule],
  controllers: [RedisController],
  providers: [RedisService, {
    provide:"REDIS_CLIENT",
    useFactory:() => {
      const redis = new Redis({
        host:process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        password:process.env.REDIS_PASSWORD,
        tls:{
          rejectUnauthorized:true
        }
      })
      return redis
    }
  },{
    provide:ConsulService,
    useFactory: async ()=>{ 
      const serviceId = uuid()
      
      return new ConsulService({
        serviceId: serviceId,
        serviceName: 'redis',
        serviceHost: process.env.SERVICE_HOST,
        servicePort: Number(process.env.SERVICE_PORT), 
        checkName:"redis-check",
        timeout:"1s",
        deregisterCriticalServiceAfter:"5s",
        checkGrpcHost:`${process.env.SERVICE_HOST}:${Number(process.env.SERVICE_PORT)}`,
        interval:"10s",
        checkId: serviceId,
      })
    }
  }],
})
export class RedisModule {}
