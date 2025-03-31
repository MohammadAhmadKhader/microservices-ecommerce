import { createDatabaseModule, createDBIfNotExist } from "./utils/utils"
import { Module } from '@nestjs/common';
import { ProductsModule } from './modules/products/products.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from '@ms/common/modules/health/health.module';
import { TraceModule } from "./modules/products/products.telemetry";

@Module({
  imports: [
    ConfigModule.forRoot(),
    TraceModule,
    ProductsModule, 
    HealthModule,
    createDatabaseModule(),
  ],
  providers:[]
})
export class AppModule {}
