import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NestFactory } from '@nestjs/core';
import { RedisModule } from './redis.module';
import { join } from 'path';
import ServiceConfig from './redis.config';

async function bootstrap() {
    const config = ServiceConfig()
    const mainApp = await NestFactory.create(RedisModule)
    mainApp.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options:{
      package:["grpc.health.v1","redis"],
      protoPath:[join(__dirname,"./protos/health.proto"),join(__dirname,"./protos/redis.proto")],
      url: config.serviceUrl
    }
  });

  await mainApp.startAllMicroservices()
  await mainApp.listen(config.metricsPort ,config.serviceHost)

  console.log(`Redis service is listening at port ${config.servicePort}`)
}
bootstrap();
