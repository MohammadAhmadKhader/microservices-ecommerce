import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports:[ClientsModule.register([
    {
      name:"users",
      transport:Transport.GRPC,
      options:{
        package:"users",
        protoPath:"./src/protos/users.proto",
        url:"localhost:3002",
      }
  },
  {
    name:"redis",
    transport:Transport.GRPC,
    options:{
      package:"redis",
      protoPath:"./src/protos/redis.proto",
      url:"localhost:6379",
    }
  }
  ])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
