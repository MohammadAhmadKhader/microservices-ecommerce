import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { SharedModule } from '../shared/shared.module';
import { UsersTraceModule } from './users.telemetry';

@Module({
  imports:[
    TypeOrmModule.forFeature([User]),
    SharedModule,
    UsersTraceModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}