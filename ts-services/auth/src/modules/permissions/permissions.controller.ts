import { Controller, UseFilters, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { PermissionsService } from './permissions.service';
import { FindAllPermissionsDto } from './dto/findAll-permission.dto';
import { FindOnePermissionById } from './dto/findOne-permission.dto';
import { ValidateGrpcPayload } from '@ms/common/decorators';
import { GrpcMetricsInterceptor, LoggingInterceptor, PROTONAME_PERMISSIONS_SERVICE, TraceMethod } from '@ms/common';
import { GenericExceptionFilter } from '@ms/common/exceptionFilters';
import { FindAllPermissionsResponse, FindOnePermissionByIdResponse } from '@ms/common/generated/permissions';

const serviceName = PROTONAME_PERMISSIONS_SERVICE

@UseFilters(GenericExceptionFilter)
@UseInterceptors(GrpcMetricsInterceptor)
@UseInterceptors(LoggingInterceptor)
@Controller()
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @GrpcMethod(serviceName, "FindAll")
  @ValidateGrpcPayload(FindAllPermissionsDto)
  @TraceMethod()
  async findAll(payload: FindAllPermissionsDto): Promise<FindAllPermissionsResponse> {
    return await this.permissionsService.findAll(payload);
  }

  @GrpcMethod(serviceName, "FindOne")
  @ValidateGrpcPayload(FindOnePermissionById)
  @TraceMethod()
  async findOne(payload: FindOnePermissionById): Promise<FindOnePermissionByIdResponse> {
    return await this.permissionsService.findOne(payload);
  }
}
