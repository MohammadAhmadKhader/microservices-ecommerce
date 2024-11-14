import { CheckOptions } from "consul/lib/agent/check";
import { RegisterOptions } from "consul/lib/agent/service";

export interface RegistryOptions {
    serviceId: string;
    serviceName: string;
    serviceHost: string;
    servicePort: number;
    checkName: string;
    timeout: string;
    interval: string;
    checkGrpcHost: string;
    checkId: string;
    deregisterCriticalServiceAfter: string;
    extraCheckOptions?: Partial<CheckOptions>,
    extraRegisterOptions?: Partial<RegisterOptions>,
    customInstanceId?: string
}