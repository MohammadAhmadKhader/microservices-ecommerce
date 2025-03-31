import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import ServiceConfig from './modules/auth/auth.config';

async function bootstrap() {
  try {
    const config = ServiceConfig()
    const mainApp = await NestFactory.create(AppModule)
    mainApp.connectMicroservice<MicroserviceOptions>({
      transport: Transport.GRPC,
      options: {
        package: ['auth', 'grpc.health.v1'],
        protoPath: ['./src/protos/auth.proto', './src/protos/health.proto'],
        url: config.serviceUrl
      },
    });
    
    await mainApp.startAllMicroservices()
    await mainApp.listen(config.metricsPort ,config.serviceHost)
    
    console.log(`auth service connected at ${config.servicePort}`)
  }catch(err) {
    console.log(err)
  }
}
bootstrap();
