import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NestFactory } from '@nestjs/core';
import { RedisModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(RedisModule, {
    transport: Transport.GRPC,
    options:{
      package:"redis",
      protoPath:join(__dirname, "../../../common/protos/redis.proto"),
      url:"localhost:6379"
    }
  });

  await app.listen();
}
bootstrap();
