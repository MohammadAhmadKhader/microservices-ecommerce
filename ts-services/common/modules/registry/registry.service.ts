import { Injectable, OnModuleDestroy, OnModuleInit} from "@nestjs/common"
import Consul from "consul";
import { v4 as uuid } from 'uuid';
import { DiscoveredService, RegistryOptions, RegistryServiceName } from "../../types";
import { getRandomInt } from "../../utils";
import { RpcNotFoundException } from "../../rpcExceprions";

@Injectable()
export class ConsulService implements OnModuleInit, OnModuleDestroy {
    private consul: Consul
    private instanceId: string
    private options: RegistryOptions

    constructor(options: RegistryOptions){
        if(!process.env.CONSUL_HOST) {
            throw new Error("CONSUL_HOST env variable is required")
        }
        
        if(!process.env.CONSUL_PORT) {
            throw new Error("CONSUL_PORT env variable is required")
        }

        this.consul = new Consul({
            host: process.env.CONSUL_HOST,
            port: Number(process.env.CONSUL_PORT),
        })

        this.options = options
        if (!this.options.customInstanceId) {
            this.instanceId = `${this.options.serviceName}-${uuid()}`
        } else {
            this.instanceId = this.options.customInstanceId
        }
    }

    async registerService() {
        try {
            await this.consul.agent.service.register({
                id: this.instanceId,
                name: this.options.serviceName,
                address: this.options.serviceHost,
                port: Number(this.options.servicePort),
                check:{
                    name: this.options.checkName,
                    timeout: this.options.timeout,
                    deregistercriticalserviceafter: this.options.deregisterCriticalServiceAfter,
                    grpc: this.options.checkGrpcHost,
                    interval: this.options.interval,
                    checkid: this.instanceId,
                    ...this.options.extraCheckOptions,
                    http:""
                },
                ...this.options.extraRegisterOptions
            })

            console.log(`new ${this.options.serviceName} instance was created with id: `, this.instanceId)
        }catch (error) {
            console.error(`unexpected error has ocurred during registering a ${this.options.serviceName} instance: `,error)
        }
    }

    async onModuleInit() {
       await this.registerService()
    }

    async deregisterService(){
        try {
            await this.consul.agent.service.deregister(this.instanceId)
            console.log(`deregistering service with id: ${this.instanceId}`)
        } catch (error) {
            console.error(`an unexpected error has ocurred during deregistering products service instance with id: ${this.instanceId}`)
        }
    }

    async discover(serviceName: RegistryServiceName) {
        try {
            const res = await this.consul.health.service({
                service: serviceName
            }) as DiscoveredService[]
            if (res.length == 0) {
                throw new RpcNotFoundException(`Service: ${serviceName} was requested and was not found`)
            }
            const selectedServiceIndex = getRandomInt(0, res.length - 1)
            const selectedInstance = res[selectedServiceIndex]
            const instanceAddress = selectedInstance.Service.Address
            const instancePort = selectedInstance.Service.Port
            
            return instanceAddress+":"+instancePort
        } catch (error) {
            console.error(error)
            throw error
        }
    }

    async onModuleDestroy() {
        await this.deregisterService()
    }
}