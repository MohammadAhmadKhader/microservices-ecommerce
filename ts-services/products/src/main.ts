import { MicroserviceOptions , Transport} from '@nestjs/microservices';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import ServiceConfig from "./products/products.config"

async function bootstrap() {
  try {
    const config = ServiceConfig()
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule,{
      transport: Transport.GRPC,
      options: {
        package: ['products','grpc.health.v1'],
        protoPath: [join(__dirname, './protos/products.proto'),join(__dirname, './protos/health.proto')],
        url: config.serviceUrl
      },
    });

    await app.listen()

    console.log(`Javascript microservice connected at ${config.servicePort}`)
  }catch(err) {
    console.log(err)
  }
}
bootstrap();
