import { ConsulService } from '@ms/common/modules/registry/registry.service';
import { MetricsModule } from '@ms/common/modules/metrics/metrics.module';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController, AuthServiceName } from './auth.controller';
import {v4 as uuid} from "uuid"
import ServiceConfig from './auth.config';
import { LoggingInterceptor, LoggingService } from '@ms/common/modules/index';

export const appServicesMap = new Map<string, any>()

@Module({
  imports:[MetricsModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
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
  },
  {
    provide:LoggingService,
    useFactory: () => {
      const serviceConfig = ServiceConfig()
      return new LoggingService({
        service: AuthServiceName,
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
    useValue: ["password", "oldPassword", "newPassword", "confirmNewPassword"],
  },
  {
    provide: LoggingInterceptor,
    useFactory: (loggingService: LoggingService, redactedKeys: string[]) => {
      return new LoggingInterceptor(loggingService, redactedKeys);
    },
    inject: [LoggingService, 'REDACTED_KEYS'],
  },
],
})
export class AuthModule {}