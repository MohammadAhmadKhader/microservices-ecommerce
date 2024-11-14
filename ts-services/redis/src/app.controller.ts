import { Controller} from '@nestjs/common';
import { RedisService } from './app.service';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateSessionRequest, CreateSessionResponse, DeleteSessionRequest, 
  DeleteSessionResponse, GetSessionRequest, GetSessionResponse,
   AuthValidateSessionRequest, AuthValidateSessionResponse } from '@ms/common/generated/redis';

const ServiceName = "SessionsService"

@Controller()
export class AppController {
  constructor(private readonly redisService: RedisService) {}

  @GrpcMethod(ServiceName, "CreateSession")
  async createSession(req : CreateSessionRequest): Promise<CreateSessionResponse> {
    return await this.redisService.createSession(req.userId);
  }

  @GrpcMethod(ServiceName, "GetSession")
  async getSession(req : GetSessionRequest): Promise<GetSessionResponse> {
    return await this.redisService.getSession(req.sessionId);
  }

  @GrpcMethod(ServiceName, "ValidateSession")
  async validateSession(req : AuthValidateSessionRequest): Promise<AuthValidateSessionResponse> {
    return await this.redisService.validateSession(req.sessionId);
  }

  @GrpcMethod(ServiceName, "DeleteSession")
  async deleteSession(req : DeleteSessionRequest): Promise<DeleteSessionResponse> {
    return await this.redisService.deleteSession(req.sessionId);
  }
}
