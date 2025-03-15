import { Controller} from '@nestjs/common';
import { RedisService } from './redis.service';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateSessionRequest, CreateSessionResponse, DeleteSessionRequest, 
  DeleteSessionResponse, GetSessionRequest, GetSessionResponse,
   AuthValidateSessionRequest, AuthValidateSessionResponse } from '@ms/common/generated/redis';
import { CreateMetricsDecorator } from "@ms/common/modules/metrics/metrics.decorator"
import { appServicesMap } from './redis.module';
import { MetricsService } from '@ms/common/modules/metrics/metrics.service';

const ServiceName = "SessionsService"
const Metrics = CreateMetricsDecorator(ServiceName, ()=> appServicesMap.get(MetricsService.name))

@Controller()
export class RedisController {
  constructor(private readonly redisService: RedisService) {}

  @GrpcMethod(ServiceName, "CreateSession")
  @Metrics("CreateSession")
  async createSession(req : CreateSessionRequest): Promise<CreateSessionResponse> {
    return await this.redisService.createSession(req.userId);
  }

  @GrpcMethod(ServiceName, "GetSession")
  @Metrics("GetSession")
  async getSession(req : GetSessionRequest): Promise<GetSessionResponse> {
    return await this.redisService.getSession(req.sessionId);
  }

  @GrpcMethod(ServiceName, "ValidateSession")
  @Metrics("GetSession")
  async validateSession(req : AuthValidateSessionRequest): Promise<AuthValidateSessionResponse> {
    return await this.redisService.validateSession(req.sessionId);
  }

  @GrpcMethod(ServiceName, "DeleteSession")
  @Metrics("DeleteSession")
  async deleteSession(req : DeleteSessionRequest): Promise<DeleteSessionResponse> {
    return await this.redisService.deleteSession(req.sessionId);
  }
}
