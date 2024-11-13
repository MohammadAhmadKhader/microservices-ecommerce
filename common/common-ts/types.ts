import * as amqp from "amqplib"
import { Check } from "consul/lib/agent/check"
import { Node } from "consul/lib/health"

export type AssertQueueParams = {queue: string, options: amqp.Options.AssertQueue}

export type AssertExchangeParams = {exchange: string,type:string ,options: amqp.Options.AssertExchange}

export type DiscoveredService = {
    Node: Node,
    Checks: Check[],
    Service: Service
}

type Service = {
    ID: string,
    Service: string,
    Tags: string[],
    Address: string,
    Meta: any,
    Port: number,
    Weights: { Passing: number, Warning: number },
    EnableTagOverride: boolean,
    Proxy: { Mode: string, MeshGateway: {}, Expose: {} },
    Connect: {},
    PeerName: string,
    CreateIndex: number,
    ModifyIndex: number
}

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