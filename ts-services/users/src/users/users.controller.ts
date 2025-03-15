import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UsersService } from './users.service';
import {CreateUserRequest, FindAllUsersRequest, FindAllUsersResponse, 
  FindOneUserByEmailRequest, FindOneUserByIdRequest, UpdateUserRequest} from "@ms/common/generated/users"
import { CreateMetricsDecorator } from "@ms/common/modules/metrics/metrics.decorator"
import { appServicesMap } from './users.module';
import { MetricsService } from '@ms/common/modules/metrics/metrics.service';

const UsersServiceName = "UsersService"
const Metrics = CreateMetricsDecorator(UsersServiceName, () => appServicesMap.get(MetricsService.name))

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @GrpcMethod(UsersServiceName,"CreateUser")
  @Metrics("CreateUser")
  async create(req: CreateUserRequest) {
    return await this.usersService.create(req);
  }

  @GrpcMethod(UsersServiceName,"FindAllUsers")
  @Metrics("FindAllUsers")
  async findAll(data : FindAllUsersRequest) : Promise<FindAllUsersResponse> {
    return await this.usersService.findAll(data.page, data.limit) as any;
  }

  @GrpcMethod(UsersServiceName,"FindOneUserById")
  @Metrics("FindOneUserById")
  async findOneById(data :FindOneUserByIdRequest) {
    return await this.usersService.findOneById(data.id);
  }

  @GrpcMethod(UsersServiceName,"FindOneUserByEmail")
  @Metrics("FindOneUserByEmail")
  async findOneByEmail(data: FindOneUserByEmailRequest) {
    return await this.usersService.findOneByEmail(data.email);
  }

  @GrpcMethod(UsersServiceName,"UpdateUser")
  @Metrics("UpdateUser")
  async update(req: UpdateUserRequest) {
    return await this.usersService.update(req);
  }

  @GrpcMethod(UsersServiceName,"DeleteUser")
  @Metrics("DeleteUser")
  async remove(id: number) {
    return await this.usersService.remove(id);
  }
}
