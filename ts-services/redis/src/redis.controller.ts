import { Controller, UseFilters, UseInterceptors} from '@nestjs/common';
import { RedisService } from './redis.service';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateSessionResponse,DeleteSessionResponse , GetSessionResponse,AuthValidateSessionResponse } from '@ms/common/generated/redis';
import { GrpcMetricsInterceptor } from '@ms/common/modules/metrics/metrics.interceptor';
import { CreateSessionDto } from './protos/dto/create-session.dto';
import { ValidateGrpcPayload, GenericExceptionFilter, LoggingInterceptor } from "@ms/common"
import { DeleteSessionDto, GetSessionDto, ValidateSessionDto } from './protos/dto/get-session.dto';

export const RedisServiceName = "RedisService"

@UseFilters(GenericExceptionFilter)
@UseInterceptors(GrpcMetricsInterceptor)
@UseInterceptors(LoggingInterceptor)
@Controller()
export class RedisController {
  constructor(private readonly redisService: RedisService) {}

  @GrpcMethod(RedisServiceName, "CreateSession")
  @ValidateGrpcPayload(CreateSessionDto)
  async createSession(req : CreateSessionDto): Promise<CreateSessionResponse> {
    return await this.redisService.createSession(req);
  }

  @GrpcMethod(RedisServiceName, "GetSession")
  @ValidateGrpcPayload(GetSessionDto)
  async getSession(req : GetSessionDto): Promise<GetSessionResponse> {
    return await this.redisService.getSession(req);
  }

  @GrpcMethod(RedisServiceName, "ValidateSession")
  @ValidateGrpcPayload(ValidateSessionDto)
  async validateSession(req : ValidateSessionDto): Promise<AuthValidateSessionResponse> {
    return await this.redisService.validateSession(req);
  }

  @GrpcMethod(RedisServiceName, "DeleteSession")
  @ValidateGrpcPayload(DeleteSessionDto)
  async deleteSession(req : DeleteSessionDto): Promise<DeleteSessionResponse> {
    return await this.redisService.deleteSession(req);
  }
}
