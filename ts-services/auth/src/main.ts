import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import ServiceConfig from './auth/auth.config';

async function bootstrap() {
  try {
    const config = ServiceConfig()
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
      transport: Transport.GRPC,
      options: {
        package: ['auth', 'grpc.health.v1'],
        protoPath: ['./src/protos/auth.proto', './src/protos/health.proto'],
        url: config.serviceUrl
      },
    });
    
    await app.listen()
    
    console.log(`auth service connected at ${config.servicePort}`)
  }catch(err) {
    console.log(err)
  }
}
bootstrap();
