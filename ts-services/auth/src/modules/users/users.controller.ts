import { Controller, UseFilters, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { FindAllUsersResponse, UsersServiceServiceName } from "@ms/common/generated/users"
import { ValidateGrpcPayload } from "@ms/common/decorators"
import { GrpcMetricsInterceptor, LoggingInterceptor, RedactKeys } from '@ms/common/modules/index';
import { DeleteUserDto, FindOneByIdDto } from './dto/delete-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto, FindOneByEmailDto } from './dto/create-user.dto';
import { FindAllDto } from './dto/findAll-user.dto';
import { GenericExceptionFilter } from "@ms/common/exceptionFilters"
import { PROTONAME_USERS_SERVICE } from '@ms/common';
import { TraceMethod } from '@ms/common/observability/telemetry';

const serviceName = PROTONAME_USERS_SERVICE

@UseFilters(GenericExceptionFilter)
@UseInterceptors(GrpcMetricsInterceptor)
@UseInterceptors(LoggingInterceptor)
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @RedactKeys(["password"])
  @GrpcMethod(serviceName,"CreateUser")
  @ValidateGrpcPayload(CreateUserDto)
  @TraceMethod()
  async create(data: CreateUserDto) {
    return await this.usersService.create(data);
  }

  @GrpcMethod(serviceName,"FindAllUsers")
  @ValidateGrpcPayload(FindAllDto)
  @TraceMethod()
  async findAll(data : FindAllDto) : Promise<FindAllUsersResponse> {
    return await this.usersService.findAll(data);
  }

  @RedactKeys(["password"])
  @GrpcMethod(serviceName,"FindOneUserById")
  @ValidateGrpcPayload(FindOneByIdDto)
  @TraceMethod()
  async findOneById(data :FindOneByIdDto) {
    return await this.usersService.findOneById(data);
  }

  @RedactKeys(["password"])
  @GrpcMethod(serviceName,"FindOneUserByEmail")
  @ValidateGrpcPayload(FindOneByEmailDto)
  @TraceMethod()
  async findOneByEmail(data: FindOneByEmailDto) {
    return await this.usersService.findOneByEmail(data);
  }

  @RedactKeys(["password"])
  @GrpcMethod(serviceName,"UpdateUser")
  @ValidateGrpcPayload(UpdateUserDto)
  @TraceMethod()
  async update(data: UpdateUserDto) {
    return await this.usersService.update(data);
  }

  @GrpcMethod(serviceName,"DeleteUser")
  @ValidateGrpcPayload(DeleteUserDto)
  @TraceMethod()
  async remove(data: DeleteUserDto) {
    return await this.usersService.remove(data);
  }
}
