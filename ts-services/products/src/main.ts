import { MicroserviceOptions , Transport} from '@nestjs/microservices';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { initTracing } from '@ms/common/observability/telemetry';

async function bootstrap() {
  try {
    const mainApp = await NestFactory.create(AppModule)
    const service = mainApp.connectMicroservice<MicroserviceOptions>({
      transport: Transport.GRPC,
      options: {
        package: ['products','grpc.health.v1'],
        protoPath: [join(__dirname, './protos/products.proto'),join(__dirname, './protos/health.proto')],
        url:"localhost:3001"
      },
    });

    mainApp.enableShutdownHooks()
    await service.listen()
    await mainApp.listen(3002)

    initTracing("products")

    console.log("Javascript microservice connected at 3001")
  }catch(err) {
    console.log(err)
  }
}
bootstrap();
