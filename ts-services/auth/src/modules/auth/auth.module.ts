import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SharedModule } from '../shared/shared.module';
import { UsersModule } from '../users/users.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports:[
    SharedModule,
    UsersModule,
    PermissionsModule,
    RolesModule
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}