import { createDatabaseModule, createDBIfNotExist } from "./utils/utils"
import { Module } from '@nestjs/common';
import { ProductsModule } from './modules/products/products.module';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from '@ms/common/modules/health/health.module';
import { TraceModule } from "./modules/products/products.telemetry";
import ServiceConfig from "./config/config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load:[ServiceConfig]
    }),
    TraceModule,
    ProductsModule, 
    HealthModule,
    createDatabaseModule(),
  ],
  providers:[]
})
export class AppModule {}
