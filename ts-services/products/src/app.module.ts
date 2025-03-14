import { createDBIfNotExist } from "./utils/utils"
import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from '@ms/common/modules/health/health.module';
import { ProductSubscriber, TraceModule } from "./products/telemtry";
@Module({
  imports: [
    ConfigModule.forRoot(),
    TraceModule,
    ProductsModule, 
    HealthModule,
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        await createDBIfNotExist();
        return {
          type: 'mysql',
          database: process.env.DB_NAME,
          username: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          port: Number(process.env.DB_PORT),
          host: process.env.DB_HOST,
          autoLoadEntities: true,
          logging: ['query', 'error', 'warn'],
          synchronize: true,
          subscribers:[ProductSubscriber]
        };
      },
    }),
  ],
  providers:[]
})
export class AppModule {}
