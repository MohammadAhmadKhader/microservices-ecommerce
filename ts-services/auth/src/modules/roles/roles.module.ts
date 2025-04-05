import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { SharedModule } from '../shared/shared.module';
import { UsersModule } from '../users/users.module';
import { RolePermission } from './entities/rolePermission.entity';
import { UserRole } from '../users/entities/userRole.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([Role, RolePermission, UserRole]),
    SharedModule,
    UsersModule
  ],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService]
})
export class RolesModule {}
