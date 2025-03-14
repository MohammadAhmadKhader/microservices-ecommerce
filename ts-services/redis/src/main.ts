import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NestFactory } from '@nestjs/core';
import { RedisModule } from './redis.module';
import { join } from 'path';
import ServiceConfig from './redis.config';

async function bootstrap() {
  const config = ServiceConfig()
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(RedisModule, {
    transport: Transport.GRPC,
    options:{
      package:["grpc.health.v1","redis"],
      protoPath:[join(__dirname,"./protos/health.proto"),join(__dirname,"./protos/redis.proto")],
      url: config.serviceUrl
    }
  });

  await app.listen();

  console.log(`Redis service is listening at port ${config.servicePort}`)
}
bootstrap();
