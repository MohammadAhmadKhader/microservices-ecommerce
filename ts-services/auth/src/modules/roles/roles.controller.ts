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
import { CreateRoleResponse, FindAllRolesResponse, FindOneRoleByIdResponse, UpdateRoleResponse } from '@ms/common/generated/roles';
import { EmptyBody } from '@ms/common/generated/shared';
import { Role } from './entities/role.entity';

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
  async create(payload: CreateRoleDto): Promise<CreateRoleResponse> {
    const result = await this.rolesService.create(payload);
    return { role: result.role.toProto() }
  }

  @GrpcMethod(serviceName, "FindAll")
  @ValidateGrpcPayload(FindAllRolesDto)
  @TraceMethod()
  async findAll(payload: FindAllRolesDto): Promise<FindAllRolesResponse> {
    const result = await this.rolesService.findAll(payload);
    return { ...result, roles: Role.toProtoArray(result.roles)}
  }

  @GrpcMethod(serviceName, "FindOne")
  @ValidateGrpcPayload(FindOneRoleDto)
  @TraceMethod()
  async findOne(payload: FindOneRoleDto): Promise<FindOneRoleByIdResponse> {
    const result = await this.rolesService.findOne(payload);
    return { role: result.role.toProto() }
  }

  @GrpcMethod(serviceName, "Update")
  @ValidateGrpcPayload(UpdateRoleDto)
  @TraceMethod()
  async update(payload: UpdateRoleDto): Promise<UpdateRoleResponse> {
    const result = await this.rolesService.update(payload);
    return { role: result.role.toProto() }
  }

  @GrpcMethod(serviceName, "Delete")
  @ValidateGrpcPayload(DeleteRoleDto)
  @TraceMethod()
  async remove(payload: DeleteRoleDto): Promise<EmptyBody> {
    return await this.rolesService.remove(payload);
  }

  @GrpcMethod(serviceName, "AssignRole")
  @ValidateGrpcPayload(AssignRoleToUserDto)
  @TraceMethod()
  async assignRole(payload: AssignRoleToUserDto): Promise<EmptyBody> {
    return await this.rolesService.assignRoleToUser(payload);
  }

  @GrpcMethod(serviceName, "UnAssignRole")
  @ValidateGrpcPayload(UnAssignRoleToUserDto)
  @TraceMethod()
  async unassignRole(payload: UnAssignRoleToUserDto): Promise<EmptyBody> {
    return await this.rolesService.unassignRole(payload);
  }
}
