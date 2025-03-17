import { MicroserviceOptions , Transport} from '@nestjs/microservices';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import ServiceConfig from "./products/products.config"
import { ConsoleLogger } from '@nestjs/common';

async function bootstrap() {
  try {
    const config = ServiceConfig()
    const appLogger = new ConsoleLogger()
    const mainApp = await NestFactory.create(AppModule, {
      logger: appLogger
    })
    mainApp.useLogger(appLogger)
    mainApp.connectMicroservice<MicroserviceOptions>({
      transport: Transport.GRPC,
      options: {
        package: ['products','grpc.health.v1'],
        protoPath: [join(__dirname, './protos/products.proto'),join(__dirname, './protos/health.proto')],
        url: config.serviceUrl
      },
    });

    await mainApp.startAllMicroservices()
    await mainApp.listen(config.metricsPort ,config.serviceHost)

    console.log(`Javascript microservice connected at ${config.servicePort}`)
  }catch(err) {
    console.log(err)
  }
}
bootstrap();
