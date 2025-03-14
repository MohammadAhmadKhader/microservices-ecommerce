import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import ServiceConfig from "./users/users.config"

async function bootstrap() {
  try {
    const config = ServiceConfig()
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
      transport: Transport.GRPC,
      options: {
        package: ['grpc.health.v1','users'],
        protoPath: [join(__dirname, './protos/health.proto'),join(__dirname, './protos/users.proto')],
        url: config.serviceUrl
      },
    });
    
    await app.listen()
    
    console.log(`users service connected at ${config.servicePort}`)
  }catch(err) {
    console.log(err)
  }
}
bootstrap();
