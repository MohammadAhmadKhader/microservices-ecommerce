
import { ConsulService, LoggingService } from "@ms/common";
import { Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ProductService } from "./products.controller";
import { INJECTION_TOKEN, ServiceConfig } from "@src/config/config";
import {v4 as uuid} from "uuid"

export const providers = [
    {
        provide: ConsulService,
        inject:[ConfigService],
        useFactory:(configService : ConfigService)=>{
          const serviceId = uuid()
          const cfg = configService.get<ServiceConfig>(INJECTION_TOKEN)
    
          return new ConsulService({
            serviceId: serviceId,
            serviceName: "products",
            serviceHost: cfg.serviceHost,
            servicePort: cfg.servicePort, 
            checkName:"products-check",
            timeout:"1s",
            deregisterCriticalServiceAfter:"5s",
            checkGrpcHost: cfg.serviceUrl,
            interval:"10s",
            checkId: serviceId,
          })
        }
      },{
        provide:LoggingService,
        inject:[ConfigService],
        useFactory: (configService : ConfigService) => {
          const cfg = configService.get<ServiceConfig>(INJECTION_TOKEN)
    
          return new LoggingService({
            service: ProductService,
            username:"",
            password:"",
            isProduction: cfg.isProduction,
            logstashHost: cfg.logstashHost,
            logstashPort: cfg.logstashPort,
          })
        }
      }
] as Provider[]