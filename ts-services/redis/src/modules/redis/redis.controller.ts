import { Controller, UseFilters, UseInterceptors} from '@nestjs/common';
import { RedisService } from './redis.service';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateSessionResponse,DeleteSessionResponse , GetSessionResponse,AuthValidateSessionResponse, GetKeyResponse } from '@ms/common/generated/redis';
import { GrpcMetricsInterceptor } from '@ms/common/modules/metrics/metrics.interceptor';
import { CreateSessionDto } from './dto/create-session.dto';
import { ValidateGrpcPayload, GenericExceptionFilter, LoggingInterceptor, TraceMethod } from "@ms/common"
import { DeleteSessionDto, GetSessionDto, ValidateSessionDto } from './dto/get-session.dto';
import { EmptyBody } from '@ms/common/generated/shared';
import { DeleteKeyDto } from './dto/delete-key.dto';
import { GetKeyDto } from './dto/get-key.dto';
import { SetKeyDto } from './dto/set-key.dto';
import { getServiceName } from '@ms/common/utils';
import { Metadata } from '@grpc/grpc-js';
import { ServerWritableStreamImpl } from '@grpc/grpc-js/build/src/server-call';

export const RedisServiceName = "RedisService"

@UseFilters(GenericExceptionFilter)
@UseInterceptors(GrpcMetricsInterceptor)
@UseInterceptors(LoggingInterceptor)
@Controller()
export class RedisController {
  constructor(private readonly redisService: RedisService) {}

  @GrpcMethod(RedisServiceName, "CreateSession")
  @ValidateGrpcPayload(CreateSessionDto)
  @TraceMethod()
  async createSession(req : CreateSessionDto): Promise<CreateSessionResponse> {
    return await this.redisService.createSession(req);
  }

  @GrpcMethod(RedisServiceName, "GetSession")
  @ValidateGrpcPayload(GetSessionDto)
  @TraceMethod()
  async getSession(req : GetSessionDto): Promise<GetSessionResponse> {
    return await this.redisService.getSession(req);
  }

  @GrpcMethod(RedisServiceName, "ValidateSession")
  @ValidateGrpcPayload(ValidateSessionDto)
  @TraceMethod()
  async validateSession(req : ValidateSessionDto): Promise<AuthValidateSessionResponse> {
    return await this.redisService.validateSession(req);
  }

  @GrpcMethod(RedisServiceName, "DeleteSession")
  @ValidateGrpcPayload(DeleteSessionDto)
  @TraceMethod()
  async deleteSession(req : DeleteSessionDto): Promise<DeleteSessionResponse> {
    return await this.redisService.deleteSession(req);
  }

  @GrpcMethod(RedisServiceName, "SetKey")
  @ValidateGrpcPayload(SetKeyDto)
  @TraceMethod()
  async setKey(payload: SetKeyDto,metadata: Metadata, serviceWritableStreamImpl: ServerWritableStreamImpl<any, any>): Promise<EmptyBody> {
    const clientServiceName = getServiceName(serviceWritableStreamImpl)
    await this.redisService.setKey(payload, clientServiceName)
    return {}
  }

  @GrpcMethod(RedisServiceName, "GetKey")
  @ValidateGrpcPayload(GetKeyDto)
  @TraceMethod()
  async getKey(payload: GetKeyDto,metadata: Metadata, serviceWritableStreamImpl: ServerWritableStreamImpl<any, any>): Promise<GetKeyResponse> {
    const clientServiceName = getServiceName(serviceWritableStreamImpl)
    return await this.redisService.getKey(payload, clientServiceName)
  }
  
  @GrpcMethod(RedisServiceName, "DeleteKey")
  @ValidateGrpcPayload(DeleteKeyDto)
  @TraceMethod()
  async deleteKey(payload: DeleteKeyDto, metadata: Metadata, serviceWritableStreamImpl: ServerWritableStreamImpl<any, any>): Promise<EmptyBody>{
    const clientServiceName = getServiceName(serviceWritableStreamImpl)
    await this.redisService.deleteKey(payload, clientServiceName)
    return {}
  }
}
