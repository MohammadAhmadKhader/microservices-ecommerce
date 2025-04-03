import { Global, Module } from "@nestjs/common";
import { AuthServiceName } from "../auth/auth.controller";
import { ConsulService, LoggingService, MetricsModule, MetricsService } from "@ms/common";
import { INJECTION_TOKEN, ServiceConfig } from "@src/config/config";
import { ConfigService } from "@nestjs/config";
import {v4 as uuid} from "uuid"

@Global()
@Module({
    imports:[
      MetricsModule
    ],
    providers:[{
        provide:ConsulService,
        inject:[ConfigService],
        useFactory: async (configService: ConfigService)=>{ 
          const serviceId = uuid()
          const cfg = configService.get<ServiceConfig>(INJECTION_TOKEN)
    
          return new ConsulService({
            serviceId: serviceId,
            serviceName: 'auth',
            serviceHost: cfg.serviceHost,
            servicePort: cfg.servicePort, 
            checkName:"auth-check",
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
          const cfg = configService.get<ServiceConfig>(INJECTION_TOKEN)
 
          return new LoggingService({
            service: AuthServiceName,
            username:"",
            password:"",
            isProduction: cfg.isProduction,
            logstashHost: cfg.logstashHost,
            logstashPort: cfg.logstashPort,
          })
        }
    }],
    exports:[LoggingService, ConsulService]
})
export class SharedModule {}