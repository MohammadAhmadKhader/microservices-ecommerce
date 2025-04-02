import { Inject, Injectable } from '@nestjs/common';
import { LoginResponse, RegistResponse, ValidateSessionResponse as AuthValidateSessionResponse} from '@ms/common/generated/auth';
import { EmptyBody} from '@ms/common/generated/shared';
import { comparePassword, hashPassword } from './utils/hash';
import { handleObservable } from '@ms/common/utils';
import {getRedisGrpcService, getUsersGrpcService} from "@ms/common/grpc"
import { ConsulService } from '@ms/common/modules/registry/registry.service';
import { SpanStatusCode, trace } from '@opentelemetry/api';
import { RpcAlreadyExistsException, RpcInternalException, RpcInvalidArgumentException, RpcUnauthorizedException } from "@ms/common/rpcExceprions"
import { TraceMethod } from '@ms/common/observability/telemetry';
import { LoginDto } from './dto/login-dto';
import { ResetPasswordDto } from './dto/reset-password-dto';
import { ValidateSessionDto } from './dto/validate-session-dto';
import { CreateSessionRequest } from '@ms/common/generated/redis';
import { v4 as uuid } from "uuid"
import { ConfigService } from '@nestjs/config';
import { INJECTION_TOKEN, ServiceConfig } from '@src/config/config';

@Injectable()
export class AuthService {
  private cookieMaxAge: number
  constructor(
    @Inject(ConsulService) private registryService: ConsulService,
    private configService: ConfigService
  ) {
    this.cookieMaxAge = this.configService.get<ServiceConfig>(INJECTION_TOKEN).cookieMaxAge
  }

  @TraceMethod()
  async login({ email, password }: LoginDto): Promise<LoginResponse> {
    const usersService = await this.getUsersService()

    const userByEmailResp = await handleObservable(usersService.FindOneUserByEmail({email}))
    const user = userByEmailResp?.user
    if (!user) {
      throw new RpcInvalidArgumentException("wrong email or password")
    }

    const isMatched = comparePassword(password, user.password)
    if (!isMatched) {
      throw new RpcInvalidArgumentException("wrong email or password")
    }
    
    const redisService = await this.getRedisService()
    const session = this.generateSession(user.id)
    const createSessionResponse = await handleObservable(redisService.CreateSession(session))
    if(!createSessionResponse.success) {
      throw new RpcInternalException("an error has occured during attempt to create the session")
    }
    
    return {user, session: createSessionResponse.session};
  }

  @TraceMethod()
  async regist({email, password, firstName, lastName}): Promise<RegistResponse> {
    const span = trace.getActiveSpan()
    const usersService = await this.getUsersService()

    const userByEmailResp = await handleObservable(usersService.FindOneUserByEmail({email}))
    const user = userByEmailResp.user
    if (user) {
      const errMsg = "User with such email already exists"
      span.setAttribute("error", true)
      span.setAttribute("error.message", errMsg)
      throw new RpcAlreadyExistsException(errMsg)
    }

    const hashedPassword = hashPassword(password)
    const createUserResponse = await handleObservable(usersService.CreateUser({
      email,
      firstName,
      lastName,
      password:hashedPassword,
    }))

    const createdUser = createUserResponse.user
    if (!createdUser) {
      const errMsg = "An unexpected error has occurred during creating user"
      span.setAttribute("error", true)
      span.setAttribute("error.message", errMsg)
      throw new RpcInternalException(errMsg)
    }
    
    const redisService = await this.getRedisService()
    const session = this.generateSession(createdUser.id)

    const createSessionResponse = await handleObservable(redisService.CreateSession(session))
    if (!createSessionResponse.success) {
      throw new RpcInternalException(createSessionResponse.message)
    }

    span.setStatus({code: SpanStatusCode.OK})

    delete createdUser.password
    return {user: createdUser, session: createSessionResponse.session};
  }

  @TraceMethod()
  async resetPassword({id: userId, oldPassword, newPassword, confirmNewPassword}: ResetPasswordDto): Promise<EmptyBody> {
    if (oldPassword == newPassword) {
      throw new RpcInvalidArgumentException("old and new password are same")
    }

    if (newPassword != confirmNewPassword) {
      throw new RpcInvalidArgumentException("new password and confirm new password must match")
    }
    
    const usersService = await this.getUsersService()

    const findUserResponse = await handleObservable(usersService.FindOneUserById({id:userId}))
    const user = findUserResponse.user
    const isMatching = comparePassword(oldPassword, user.password)
    if (!isMatching) {
      throw new RpcInvalidArgumentException("invalid password")
    }
    const hashedPassword = hashPassword(newPassword)
    await handleObservable(usersService.UpdateUser({id:user.id, password: hashedPassword}))

    return {};
  }

  @TraceMethod()
  async validateSession({sessionId}: ValidateSessionDto): Promise<AuthValidateSessionResponse> {
    const redisService = await this.getRedisService()
    const validateSessionResponse = await handleObservable(redisService.ValidateSession({sessionId:sessionId}))
    if (!validateSessionResponse.success) {
      throw new RpcUnauthorizedException(`Unauthorized - ${validateSessionResponse.message}`)
    }

    const usersService = await this.getUsersService()
    const findOneUserResponse = await handleObservable(usersService.FindOneUserById({id:validateSessionResponse.session.userId}))
    if (!findOneUserResponse.user) {
      return { sessionId: "", user: null}
    }

    return { sessionId: validateSessionResponse.session.id, user: findOneUserResponse.user}
  }


  private async getRedisService(){
    const redisGrpcAddr = await this.registryService.discover("redis")
    return getRedisGrpcService(redisGrpcAddr).getService()
  }

  private async getUsersService(){
    const usersGrpcAddr = await this.registryService.discover("users")
    return getUsersGrpcService(usersGrpcAddr).getService()
  }

  private generateSession(userId: number): CreateSessionRequest {
    const sessionId = uuid()
    
    console.log(Date.now(), this.cookieMaxAge)
    return {
      session :{
        id: sessionId,
        userId,
        createdAt: Date.now(),
        expiresAt: Date.now() + this.cookieMaxAge,
        cookieMaxAge: this.cookieMaxAge
      }
    }
  }
}
