import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from '@ms/common/modules/health/health.module';
import { TraceModule } from './auth/telemetry';
import { ConfigModule} from '@nestjs/config';
@Module({
  imports: [
    ConfigModule.forRoot(),
    TraceModule,
    AuthModule,
    HealthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
