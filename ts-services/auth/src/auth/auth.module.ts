import { ConsulService } from '@ms/common/modules/registry/registry.service';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule} from '@nestjs/config';
import {v4 as uuid} from "uuid"
@Module({
  imports:[ConfigModule.forRoot()],
  controllers: [AuthController],
  providers: [AuthService,{
    provide:ConsulService,
    useFactory: async ()=>{ 
      const serviceId = uuid()
      
      return new ConsulService({
        serviceId: serviceId,
        serviceName: 'auth',
        serviceHost: process.env.SERVICE_HOST,
        servicePort: Number(process.env.SERVICE_PORT), 
        checkName:"auth-check",
        timeout:"1s",
        deregisterCriticalServiceAfter:"5s",
        checkGrpcHost:`${process.env.SERVICE_HOST}:${Number(process.env.SERVICE_PORT)}`,
        interval:"10s",
        checkId: serviceId,
      })
    }
  }],
})
export class AuthModule {}
