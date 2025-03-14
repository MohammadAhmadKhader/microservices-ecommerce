import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { HealthModule } from '@ms/common/modules/health/health.module';
import { TraceModule, UsersTelemtrySubsecriber } from './users/telemetry';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TraceModule,
    UsersModule,
    HealthModule,
    TypeOrmModule.forRoot({
      type:"mysql",
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: Number(process.env.DB_PORT),
      host: process.env.DB_HOST,
      autoLoadEntities:true,
      logging:true,
      synchronize:true,
      subscribers:[UsersTelemtrySubsecriber]
    }),
    ],
  controllers: [],
  providers: [],
  exports:[AppModule]
})
export class AppModule {}
