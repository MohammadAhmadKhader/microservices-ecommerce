import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  try {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
      transport: Transport.GRPC,
      options: {
        package: 'auth',
        protoPath: './src/protos/auth.proto',
        url:"localhost:3003"
      },
    });
    
    await app.listen()
    
    console.log("auth service connected at 3003")
  }catch(err) {
    console.log(err)
  }
}
bootstrap();
