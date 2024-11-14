import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { RedisService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { Redis } from 'ioredis';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController],
  // redis provider here only for development
  providers: [RedisService, {
    provide:"REDIS_CLIENT",
    useFactory:() => {
      const redis = new Redis({
        host:process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        password:process.env.REDIS_PASSWORD,
        tls:{
          rejectUnauthorized:true
        }
      })
      return redis
    }
  }],
})
export class RedisModule {}
