import { DynamicModule, Global, Module } from "@nestjs/common"
import { ConsulService } from "./registry.service";
import { ConfigService} from "@nestjs/config"
import { RegistryOptions } from "../../types";

@Global()
@Module({
    imports:[],
    providers:[ConsulService]
})
export class ConsulModule{
    static register(options: RegistryOptions): DynamicModule {
        return {
          module: ConsulModule,
          providers: [
            {
              provide: ConsulService,
              useFactory: async () => {
                return new ConsulService({
                  serviceId: options.serviceId,
                  serviceName: options.serviceName,
                  serviceHost: options.serviceHost,
                  servicePort: options.servicePort,
                  checkName: options.checkName,
                  timeout: options.timeout,
                  deregisterCriticalServiceAfter: options.deregisterCriticalServiceAfter,
                  checkGrpcHost: options.checkGrpcHost,
                  interval: options.interval,
                  checkId: options.checkId,
                });
              },
            },
          ],
          exports: [ConsulService],
        };
}}