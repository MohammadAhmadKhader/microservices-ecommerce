import Consul from "consul"
import { CheckOptions } from "consul/lib/agent/check"

export class Registry{
    consul : Consul
    private readonly defaultOptions: CheckOptions = {
        name:"",
        timeout: "1s",
        deregistercriticalserviceafter: "2s",
        grpc:`${process.env.SERVICE_HOST}:3001`,
        interval:"10s",
    }
    
    async createNewInstance(id: string, serviceName: string, checkOptions: CheckOptions = this.defaultOptions){
        this.defaultOptions.name = `${serviceName}-check`
        checkOptions = { ...this.defaultOptions, ...checkOptions}

        return await this.consul.agent.service.register({
            id: id,
            name: serviceName,
            address: process.env.SERVICE_HOST,
            port: 3001, // port will be dynamic later
            check:checkOptions
        })
    }

    async deregister(instanceId: string) {
       return await this.consul.agent.service.deregister(instanceId)
    }
}