import { ClientGrpcProxy, ClientProxyFactory, Transport } from "@nestjs/microservices"
import { ObservableUsersService, GrpcServiceName, ObservableSessionsService, ObservableProductsService, ObservableAuthService, ObservableOrdersService } from "./types"
import { join } from "path"

export class CreateGrpcService<TGrpcService> {
    private client: ClientGrpcProxy
    private serviceName: string
  
    constructor(grpcUrl:string, protoPath:string, packageName: string, serviceName: GrpcServiceName) {
      this.serviceName = serviceName
      this.client = ClientProxyFactory.create({
        transport:Transport.GRPC,
        options:{
          package: packageName,
          url: grpcUrl,
          protoPath,
        }
      })
    }
  
    getService() {
      return this.client.getService<TGrpcService>(this.serviceName)
    }
}

export const getOrdersGrpcService = (grpcUrl: string, protoPath = join(__dirname, "./protos/orders.proto")) => {
  return new CreateGrpcService<ObservableOrdersService>(grpcUrl, protoPath, "orders", "OrderService")
}

export const getProductsGrpcService = (grpcUrl: string, protoPath = join(__dirname, "./protos/products.proto")) => {
  return new CreateGrpcService<ObservableProductsService>(grpcUrl, protoPath, "products", "ProductsService")
}

export const getRedisGrpcService = (grpcUrl: string, protoPath = join(__dirname, "./protos/redis.proto")) => {
  return new CreateGrpcService<ObservableSessionsService>(grpcUrl, protoPath, "redis", "RedisService")
}

export const getUsersGrpcService = (grpcUrl: string, protoPath = join(__dirname, "./protos/users.proto")) => {
  return new CreateGrpcService<ObservableUsersService>(grpcUrl, protoPath, "users", "UsersService")
}

export const getAuthGrpcService = (grpcUrl: string, protoPath = join(__dirname, "./protos/auth.proto")) => {
  return new CreateGrpcService<ObservableAuthService>(grpcUrl, protoPath, "auth", "AuthService")
}