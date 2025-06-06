import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { INJECTION_TOKEN, ServiceConfig } from '@src/config/config';
import { CommandFactory } from 'nest-commander';
import { AuthCliModule } from './modules/cli/cli.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  try {
    if(process.argv.includes("seed")) {
      await CommandFactory.run(AuthCliModule, ["log", "error", "warn"])
  
      return
    }

    const mainApp = await NestFactory.create(AppModule)
    const configService = mainApp.get(ConfigService)
    const config = configService.get<ServiceConfig>(INJECTION_TOKEN)

    mainApp.connectMicroservice<MicroserviceOptions>({
      transport: Transport.GRPC,
      options: {
        package: ["auth", "permissions", "roles", "users", "grpc.health.v1"],
        protoPath: [
          "./src/protos/auth.proto", 
          "./src/protos/permissions.proto", 
          "./src/protos/roles.proto", 
          "./src/protos/users.proto", 
          "./src/protos/health.proto"],
        url: config.serviceUrl
      },
    });
    
    mainApp.enableShutdownHooks()
    
    await mainApp.startAllMicroservices()
    await mainApp.listen(config.metricsPort ,config.serviceHost)
    
    console.log(`auth service connected at ${config.serviceUrl}`)
  }catch(err) {
    console.log(err)
  }
}
bootstrap();
