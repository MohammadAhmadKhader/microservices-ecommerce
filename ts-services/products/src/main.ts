import { MicroserviceOptions , Transport} from '@nestjs/microservices';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { INJECTION_TOKEN, ServiceConfig } from "@src/config/config"
import {ConfigService} from "@nestjs/config"
import { CommandFactory } from 'nest-commander';
import { ProductsCLIModule } from './modules/cli/cli.module';

async function bootstrap() {
  try {
    if(process.argv.includes("seed")) {
      await CommandFactory.run(ProductsCLIModule, ["log", "error", "warn"])

      return
    }

    const mainApp = await NestFactory.create(AppModule)
    const configService = mainApp.get(ConfigService)
    const config = configService.get<ServiceConfig>(INJECTION_TOKEN)
    
    mainApp.connectMicroservice<MicroserviceOptions>({
      transport: Transport.GRPC,
      options: {
        package: ['products','grpc.health.v1'],
        protoPath: [join(__dirname, './protos/products.proto'),join(__dirname, './protos/health.proto')],
        url: config.serviceUrl
      },
    });

    mainApp.enableShutdownHooks()

    await mainApp.startAllMicroservices()
    await mainApp.listen(config.metricsPort ,config.serviceHost)

    console.log(`Javascript microservice connected at ${config.serviceUrl}`)
  }catch(err) {
    console.log(err)
  }
}
bootstrap();
