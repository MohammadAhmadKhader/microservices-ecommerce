import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from '@ms/common/modules/health/health.module';
import { ConfigModule} from '@nestjs/config';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import ServiceConfig from './config/config';
import { createDbModule } from './utils/utils';
import { UsersTelemtrySubsecriber } from './modules/users/users.telemetry';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load:[ServiceConfig]
    }),
    createDbModule([UsersTelemtrySubsecriber]),
    HealthModule,
    AuthModule,
    RolesModule,
    PermissionsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
