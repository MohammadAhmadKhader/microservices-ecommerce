import {Injectable, OnApplicationShutdown, OnModuleDestroy, OnModuleInit} from "@nestjs/common"
import Consul from "consul";
import { v4 as uuid } from 'uuid';
import { RegistryOptions } from "../../types";
import { DiscoveredService } from "../../types";
import { getRandomInt } from "../../utils";
import { RpcException } from "@nestjs/microservices";

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
                    status:"passing",
                    ...this.options.extraCheckOptions,
                }, 
                ...this.options.extraRegisterOptions,
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

    async discover(serviceName: string) {
        try {
            const res = await this.consul.health.service({
                service:serviceName
            }) as DiscoveredService[]
            if (res.length == 0) {
                throw new RpcException(`Service: ${serviceName} was requested and was not found`)
            }

            const selectedServiceIndex = getRandomInt(0, res.length - 1)
            const selectedInstance = res[selectedServiceIndex]
            const instanceAddress = selectedInstance.Service.Address
            
            return instanceAddress
        } catch (error) {
            console.error(error)
        }
    }

    async onApplicationShutdown() {
        await this.deregisterService()
    }
}