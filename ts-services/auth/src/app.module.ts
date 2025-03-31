import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from '@ms/common/modules/health/health.module';
import { TraceModule } from './modules/auth/auth.telemetry';
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
