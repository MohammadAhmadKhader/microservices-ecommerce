import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NestFactory } from '@nestjs/core';
import { RedisModule } from './redis.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(RedisModule, {
    transport: Transport.GRPC,
    options:{
      package:["grpc.health.v1","redis"],
      protoPath:[join(__dirname,"./protos/health.proto"),join(__dirname,"./protos/redis.proto")],
      url:"localhost:6379"
    }
  });

  await app.listen();
}
bootstrap();
