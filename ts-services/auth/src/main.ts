import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  try {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
      transport: Transport.GRPC,
      options: {
        package: ['auth', 'grpc.health.v1'],
        protoPath: ['./src/protos/auth.proto', './src/protos/health.proto'],
        url:`${process.env.SERVICE_HOST+":"+process.env.SERVICE_PORT}`
      },
    });
    
    await app.listen()
    
    console.log("auth service connected at 3003")
  }catch(err) {
    console.log(err)
  }
}
bootstrap();
