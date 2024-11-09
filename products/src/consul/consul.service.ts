import {Injectable, OnApplicationShutdown, OnModuleDestroy} from "@nestjs/common"
import Consul from "consul";
import { v4 as uuid } from 'uuid';

@Injectable()
export class ConsulService implements OnModuleDestroy, OnApplicationShutdown {
    private consul: Consul
    private instanceId: string

    constructor(){
        this.consul = new Consul({
            host: process.env.CONSUL_HOST,
            port: Number(process.env.CONSUL_PORT),
        })

        this.instanceId = uuid()
    }

    async registerService() {
        try {
            await this.consul.agent.service.register({
                id: this.instanceId,
                name:"products",
                address: process.env.SERVICE_HOST,
                port: 3001, // port will be dynamic later
                check:{
                    name:"products-check",
                    ttl:"10s",
                    timeout:"1s",
                    deregistercriticalserviceafter:"5s",
                }
            })

            console.log("new products instance was created with id: ", this.instanceId)
        }catch (error) {
            console.error(`unexpected error has ocurred during registering a products instance: `,error)
        }
    }

    async deregisterService(){
        try {
            await this.consul.agent.service.deregister(this.instanceId)
            console.log(`deregistering service with id: ${this.instanceId}`)
        } catch (error) {
            console.error(`an unexpected error has ocurred during deregistering products service instance with id: ${this.instanceId}`)
        }
    }

    async onModuleDestroy() {
        await this.deregisterService()
    }
    async onApplicationShutdown() {
        await this.deregisterService()
    }
}