import { MicroserviceOptions , Transport} from '@nestjs/microservices';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  try {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
      transport: Transport.GRPC,
      options: {
        package: ['products','grpc.health.v1'],
        protoPath: [join(__dirname, './protos/products.proto'),join(__dirname, './protos/health.proto')],
        url:"localhost:3001"
      },
    });

    app.enableShutdownHooks()
    await app.listen()
    
    console.log("Javascript microservice connected at 3001")
  }catch(err) {
    console.log(err)
  }
}
bootstrap();
