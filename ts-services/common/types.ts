import * as amqp from "amqplib"
import { Check } from "consul/lib/agent/check"
import { Node } from "consul/lib/health"
import { CheckOptions } from "consul/lib/agent/check";
import { RegisterOptions } from "consul/lib/agent/service";
import { Observable } from "rxjs"
import { UsersService } from "./generated/users"
import { RedisService } from "./generated/redis"
import { ProductsService } from "./generated/products"
import { OrderService } from "./generated/orders"
import { AuthService } from "./generated/auth"
import { PermissionsService } from "./generated/permissions";
import { RolesService } from "./generated/roles";

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

export interface RegistryOptions {
    serviceId: string;
    serviceName: RegistryServiceName;
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

export type ObservableService<T> = {
    [K in keyof T]: T[K] extends (...args: infer TArgs) => Promise<infer TResult>
      ? (...args: TArgs) => Observable<Promise<TResult>>
      : T[K];
};

export type ObservableUsersService = ObservableService<UsersService>
export type ObservableSessionsService = ObservableService<RedisService>
export type ObservableProductsService = ObservableService<ProductsService>
export type ObservableOrdersService = ObservableService<OrderService>
export type ObservableAuthService = ObservableService<AuthService>
export type ObservableRolesService = ObservableService<RolesService>
export type ObservablePermissionsService = ObservableService<PermissionsService>

export type GrpcServiceName = "OrderService" | "ProductsService" | "AuthService" | "UsersService" | "Health" | "RedisService" | "RolesService" | "PermissionsService"
export type RegistryServiceName = "products" | "auth" | "orders" | "gateway" | "redis" 
export type ProtoPackageName = "products" | "auth" | "permissions" | "roles" | "orders" | "grpc.health.v1" | "redis" | "users"


export interface ICreatedAtTimeStamp {
  createdAt: Date
}

export interface IUpdatedAtTimeStamp {
  updatedAt: Date
}

export type TimestampsMode = "updatedAt" | "createdAt" | "both"