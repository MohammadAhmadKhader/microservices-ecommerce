import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  try {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
      transport: Transport.GRPC,
      options: {
        package: 'auth',
        protoPath: join(__dirname, '../../../common/protos/auth.proto'),
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
