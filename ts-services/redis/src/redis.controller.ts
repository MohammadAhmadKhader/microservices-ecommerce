import { Controller, UseFilters, UseInterceptors} from '@nestjs/common';
import { RedisService } from './redis.service';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateSessionResponse,DeleteSessionResponse , GetSessionResponse,AuthValidateSessionResponse } from '@ms/common/generated/redis';
import { GrpcMetricsInterceptor } from '@ms/common/modules/metrics/metrics.interceptor';
import { LoggingInterceptor } from "@ms/common/observability/logger"
import { CreateSessionDto } from './protos/dto/create-session.dto';
import { ValidateGrpcPayload } from "@ms/common/decorators"
import { DeleteSessionDto, GetSessionDto, ValidateSessionDto } from './protos/dto/get-session.dto';
import {GenericExceptionFilter} from "@ms/common/exceptionFilters"

const ServiceName = "RedisService"

@UseFilters(GenericExceptionFilter)
@UseInterceptors(GrpcMetricsInterceptor)
@UseInterceptors(new LoggingInterceptor())
@Controller()
export class RedisController {
  constructor(private readonly redisService: RedisService) {}

  @GrpcMethod(ServiceName, "CreateSession")
  @ValidateGrpcPayload(CreateSessionDto)
  async createSession(req : CreateSessionDto): Promise<CreateSessionResponse> {
    return await this.redisService.createSession(req);
  }

  @GrpcMethod(ServiceName, "GetSession")
  @ValidateGrpcPayload(GetSessionDto)
  async getSession(req : GetSessionDto): Promise<GetSessionResponse> {
    return await this.redisService.getSession(req);
  }

  @GrpcMethod(ServiceName, "ValidateSession")
  @ValidateGrpcPayload(ValidateSessionDto)
  async validateSession(req : ValidateSessionDto): Promise<AuthValidateSessionResponse> {
    return await this.redisService.validateSession(req);
  }

  @GrpcMethod(ServiceName, "DeleteSession")
  @ValidateGrpcPayload(DeleteSessionDto)
  async deleteSession(req : DeleteSessionDto): Promise<DeleteSessionResponse> {
    return await this.redisService.deleteSession(req);
  }
}
