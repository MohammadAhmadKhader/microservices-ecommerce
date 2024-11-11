import {Injectable, OnApplicationShutdown, OnModuleDestroy, OnModuleInit} from "@nestjs/common"
import Consul from "consul";
import { v4 as uuid } from 'uuid';
import { RegistryOptions } from "./registry.options";

@Injectable()
export class ConsulService implements OnApplicationShutdown, OnModuleInit {
    private consul: Consul
    private instanceId: string
    private options: RegistryOptions

    constructor(options: RegistryOptions){
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

    async onApplicationShutdown() {
        await this.deregisterService()
    }
}