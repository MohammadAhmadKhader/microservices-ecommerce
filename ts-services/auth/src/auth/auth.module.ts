import { ConsulService } from '@ms/common/modules/registry/registry.service';
import { MetricsModule } from '@ms/common/modules/metrics/metrics.module';
import { MetricsService } from '@ms/common/modules/metrics/metrics.service';
import { Module, OnModuleInit } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import {v4 as uuid} from "uuid"
import ServiceConfig from './auth.config';

export const appServicesMap = new Map<string, any>()

@Module({
  imports:[MetricsModule],
  controllers: [AuthController],
  providers: [AuthService,{
    provide:ConsulService,
    useFactory: async ()=>{ 
      const serviceId = uuid()
      const serviceConfig = ServiceConfig()
      return new ConsulService({
        serviceId: serviceId,
        serviceName: 'auth',
        serviceHost: serviceConfig.serviceHost,
        servicePort: serviceConfig.servicePort, 
        checkName:"auth-check",
        timeout:"1s",
        deregisterCriticalServiceAfter:"5s",
        checkGrpcHost: serviceConfig.serviceUrl,
        interval:"10s",
        checkId: serviceId,
      })
    }
  }],
})
export class AuthModule implements OnModuleInit{
  constructor(private readonly metricsSerivce: MetricsService) {

  }
  onModuleInit() {
      appServicesMap.set(MetricsService.name, this.metricsSerivce)
  }
}