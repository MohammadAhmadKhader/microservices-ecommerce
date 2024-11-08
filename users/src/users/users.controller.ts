import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UsersService } from './users.service';
import {CreateUserRequest, FindAllUsersRequest, FindAllUsersResponse, 
  FindOneUserByEmailRequest, FindOneUserByIdRequest, UpdateUserRequest} from "../../generated/users"

const UsersServiceName = "UsersService"

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @GrpcMethod(UsersServiceName,"CreateUser")
  async create(req: CreateUserRequest) {
    return await this.usersService.create(req);
  }

  @GrpcMethod(UsersServiceName,"FindAllUsers")
  async findAll(data : FindAllUsersRequest) : Promise<FindAllUsersResponse> {
    return await this.usersService.findAll(data.page, data.limit) as any;
  }

  @GrpcMethod(UsersServiceName,"FindOneUserById")
  async findOneById(data :FindOneUserByIdRequest) {
    return await this.usersService.findOneById(data.id);
  }

  @GrpcMethod(UsersServiceName,"FindOneUserByEmail")
  async findOneByEmail(data: FindOneUserByEmailRequest) {
    return await this.usersService.findOneByEmail(data.email);
  }

  @GrpcMethod(UsersServiceName,"UpdateUser")
  async update(req: UpdateUserRequest) {
    return await this.usersService.update(req);
  }

  @GrpcMethod(UsersServiceName,"DeleteUser")
  async remove(id: number) {
    return await this.usersService.remove(id);
  }
}
