import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from '@ms/common/modules/health/health.module';
@Module({
  imports: [
    ProductsModule, 
    HealthModule,
    ConfigModule.forRoot(),
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
    })
  ]
})
export class AppModule {}
