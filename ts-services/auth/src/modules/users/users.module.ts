import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { SharedModule } from '../shared/shared.module';
import { UsersTraceModule } from './users.telemetry';
import { UserRole } from './entities/userRole.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([User, UserRole]),
    SharedModule,
    UsersTraceModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}