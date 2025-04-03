import { Controller, UseFilters, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { FindAllRolesDto } from './dto/findAll-role.dto';
import { DeleteRoleDto } from './dto/delete-role.dto';
import { FindOneRoleDto } from './dto/findOne-role.dto';
import { ValidateGrpcPayload } from '@ms/common/decorators';
import { UnAssignRoleToUserDto } from './dto/unassign-role.dto';
import { AssignRoleToUserDto } from './dto/assign-role.dto';
import { GrpcMetricsInterceptor, LoggingInterceptor, PROTONAME_ROLES_SERVICE, TraceMethod } from '@ms/common';
import { GenericExceptionFilter } from '@ms/common/exceptionFilters';

const serviceName = PROTONAME_ROLES_SERVICE

@UseFilters(GenericExceptionFilter)
@UseInterceptors(GrpcMetricsInterceptor)
@UseInterceptors(LoggingInterceptor)
@Controller()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @GrpcMethod(serviceName, "Create")
  @ValidateGrpcPayload(CreateRoleDto)
  @TraceMethod()
  async create(payload: CreateRoleDto) {
    return await this.rolesService.create(payload);
  }

  @GrpcMethod(serviceName, "FindAll")
  @ValidateGrpcPayload(FindAllRolesDto)
  @TraceMethod()
  async findAll(payload: FindAllRolesDto) {
    return await this.rolesService.findAll(payload);
  }

  @GrpcMethod(serviceName, "FindOne")
  @ValidateGrpcPayload(FindOneRoleDto)
  @TraceMethod()
  async findOne(payload: FindOneRoleDto) {
    return await this.rolesService.findOne(payload);
  }

  @GrpcMethod(serviceName, "Update")
  @ValidateGrpcPayload(UpdateRoleDto)
  @TraceMethod()
  async update(payload: UpdateRoleDto) {
    return await this.rolesService.update(payload);
  }

  @GrpcMethod(serviceName, "Delete")
  @ValidateGrpcPayload(DeleteRoleDto)
  @TraceMethod()
  async remove(payload: DeleteRoleDto) {
    return await this.rolesService.remove(payload);
  }

  @GrpcMethod(serviceName, "AssignRole")
  @ValidateGrpcPayload(AssignRoleToUserDto)
  @TraceMethod()
  async assignRole(payload: AssignRoleToUserDto) {
    return await this.rolesService.assignRoleToUser(payload);
  }

  @GrpcMethod(serviceName, "UnAssignRole")
  @ValidateGrpcPayload(UnAssignRoleToUserDto)
  @TraceMethod()
  async unassignRole(payload: UnAssignRoleToUserDto) {
    return await this.rolesService.unassignRole(payload);
  }
}
