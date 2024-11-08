import { MicroserviceOptions , Transport} from '@nestjs/microservices';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  try {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
      transport: Transport.GRPC,
      options: {
        // as inside the proto file name
        // watches only applies to folders & files inside "src" folder
        package: 'products',
        protoPath: join(__dirname, '../../../common/protos/products.proto'),
        url:"localhost:3001"
      },
    });
    
    await app.listen()
    
    console.log("Javascript microservice connected at 3001")
  }catch(err) {
    console.log(err)
  }
}
bootstrap();
