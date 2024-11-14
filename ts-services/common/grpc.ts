import { ClientGrpcProxy, ClientProxyFactory, Transport } from "@nestjs/microservices"

export class CreateGrpcService<TGrpcService> {
    private client: ClientGrpcProxy
    private serviceName: string
  
    constructor(grpcUrl:string, protoPath:string, packageName: string, serviceName:string) {
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