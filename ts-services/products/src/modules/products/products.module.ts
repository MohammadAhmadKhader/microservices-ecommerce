import { MetricsModule } from '@ms/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { ProductTelemetrySubscriber } from './products.telemetry';
import { providers } from './products.providers';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    MetricsModule,
  ],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    ProductTelemetrySubscriber,
    ...providers
]})
export class ProductsModule {}