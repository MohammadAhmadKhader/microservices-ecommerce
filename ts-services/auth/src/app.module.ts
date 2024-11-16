import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from '@ms/common/modules/health/health.module';
@Module({
  imports: [AuthModule,HealthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
