import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  try {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
      transport: Transport.GRPC,
      options: {
        package: ['grpc.health.v1','users'],
        protoPath: [join(__dirname, './protos/health.proto'),join(__dirname, './protos/users.proto')],
        url:"localhost:3002"
      },
    });
    
    await app.listen()
    
    console.log("users service connected at 3002")
  }catch(err) {
    console.log(err)
  }
}
bootstrap();
