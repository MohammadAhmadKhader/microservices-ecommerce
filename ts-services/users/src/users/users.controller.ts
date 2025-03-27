import { Controller, UseFilters, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { FindAllUsersResponse } from "@ms/common/generated/users"
import { ValidateGrpcPayload } from "@ms/common/decorators"
import { GrpcMetricsInterceptor, LoggingInterceptor } from '@ms/common/modules/index';
import { DeleteUserDto, FindOneByIdDto } from './dto/delete-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto, FindOneByEmailDto } from './dto/create-user.dto';
import { FindAllDto } from './dto/findAll-user.dto';
import { GenericExceptionFilter } from "@ms/common/exceptionFilters"

export const UsersServiceName = "UsersService"

@UseFilters(GenericExceptionFilter)
@UseInterceptors(GrpcMetricsInterceptor)
@UseInterceptors(LoggingInterceptor)
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @GrpcMethod(UsersServiceName,"CreateUser")
  @ValidateGrpcPayload(CreateUserDto)
  async create(data: CreateUserDto) {
    return await this.usersService.create(data);
  }

  @GrpcMethod(UsersServiceName,"FindAllUsers")
  @ValidateGrpcPayload(FindAllDto)
  async findAll(data : FindAllDto) : Promise<FindAllUsersResponse> {
    return await this.usersService.findAll(data);
  }

  @GrpcMethod(UsersServiceName,"FindOneUserById")
  @ValidateGrpcPayload(FindOneByIdDto)
  async findOneById(data :FindOneByIdDto) {
    return await this.usersService.findOneById(data);
  }

  @GrpcMethod(UsersServiceName,"FindOneUserByEmail")
  @ValidateGrpcPayload(FindOneByEmailDto)
  async findOneByEmail(data: FindOneByEmailDto) {
    return await this.usersService.findOneByEmail(data);
  }

  @GrpcMethod(UsersServiceName,"UpdateUser")
  @ValidateGrpcPayload(UpdateUserDto)
  async update(data: UpdateUserDto) {
    return await this.usersService.update(data);
  }

  @GrpcMethod(UsersServiceName,"DeleteUser")
  @ValidateGrpcPayload(DeleteUserDto)
  async remove(data: DeleteUserDto) {
    return await this.usersService.remove(data);
  }
}
