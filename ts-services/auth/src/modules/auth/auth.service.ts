import { Inject, Injectable } from '@nestjs/common';
import { comparePassword, hashPassword } from '../../utils/hash';
import { handleObservable } from '@ms/common/utils';
import { getRedisGrpcService } from "@ms/common/grpc"
import { ConsulService } from '@ms/common/modules/registry/registry.service';
import { SpanStatusCode, trace } from '@opentelemetry/api';
import { RpcAlreadyExistsException, RpcInternalException, RpcInvalidArgumentException, RpcUnauthorizedException } from "@ms/common/rpcExceprions"
import { LoginDto } from './dto/login-dto';
import { ResetPasswordDto } from './dto/reset-password-dto';
import { ValidateSessionDto } from './dto/validate-session-dto';
import { CreateSessionRequest } from '@ms/common/generated/redis';
import { v4 as uuid } from "uuid"
import { ConfigService } from '@nestjs/config';
import { INJECTION_TOKEN, ServiceConfig } from '@src/config/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  private cookieMaxAge: number
  constructor(
    @Inject(ConsulService) private registryService: ConsulService,
    @Inject(UsersService) private readonly usersService: UsersService,
    private configService: ConfigService
  ) {
    this.cookieMaxAge = this.configService.get<ServiceConfig>(INJECTION_TOKEN).cookieMaxAge
  }

  async login({ email, password }: LoginDto) {
    const span = trace.getActiveSpan()
  
    const userByEmailResp = await this.usersService.findOneByEmailWithDetails({email})
    const user = userByEmailResp?.user
    if (!user) {
      const errMsg = "wrong email or password"
      span.setAttribute("error", true)
      span.setAttribute("error.message", errMsg)
      throw new RpcInvalidArgumentException(errMsg)
    }

    span.addEvent("comparing passwords started")
    const isMatched = comparePassword(password, user.password)
    if (!isMatched) {
      const errMsg = "wrong email or password"
      span.setAttribute("error", true)
      span.setAttribute("error.message", errMsg)
      throw new RpcInvalidArgumentException(errMsg)
    }
    span.addEvent("comparing passwords ended")

    const redisService = await this.getRedisService()
    const session = this.generateSession(user.id)
    const createSessionResponse = await handleObservable(redisService.CreateSession(session))
    if(!createSessionResponse.success) {
      throw new RpcInternalException("an error has occured during attempt to create the session")
    }
    return { user, session: createSessionResponse.session};
  }

  async regist({email, password, firstName, lastName}) {
    const span = trace.getActiveSpan()

    const userByEmailResp = await this.usersService.findOneByEmail({email})
    const user = userByEmailResp.user
    if (user) {
      const errMsg = "User with such email already exists"
      span.setAttribute("error", true)
      span.setAttribute("error.message", errMsg)
      throw new RpcAlreadyExistsException(errMsg)
    }

    const hashedPassword = hashPassword(password)
    const createUserResponse = await this.usersService.create({
      email,
      firstName,
      lastName,
      password:hashedPassword,
    })

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

  async resetPassword({id: userId, oldPassword, newPassword, confirmNewPassword}: ResetPasswordDto) {
    const span = trace.getActiveSpan()
    if (oldPassword == newPassword) {
      const errMsg = "old and new password are same"
      span.setAttribute("error", true)
      span.setAttribute("error.message", errMsg)
      throw new RpcInvalidArgumentException(errMsg)
    }

    if (newPassword != confirmNewPassword) {
      const errMsg = "new password and confirm new password must match"
      span.setAttribute("error", true)
      span.setAttribute("error.message", errMsg)
      throw new RpcInvalidArgumentException(errMsg)
    }

    const findUserResponse = await this.usersService.findOneById({id:userId})
    const user = findUserResponse.user
    const isMatching = comparePassword(oldPassword, user.password)
    if (!isMatching) {
      const errMsg = "invalid password"
      span.setAttribute("error", true)
      span.setAttribute("error.message", errMsg)
      throw new RpcInvalidArgumentException(errMsg)
    }

    const hashedPassword = hashPassword(newPassword)
    await this.usersService.changeUserPassword({user, newPassword: hashedPassword})

    return {};
  }

  async validateSession({sessionId}: ValidateSessionDto) {
    const span = trace.getActiveSpan()
    
    const redisService = await this.getRedisService()
    const validateSessionResponse = await handleObservable(redisService.ValidateSession({sessionId:sessionId}))
    
    if (!validateSessionResponse.success) {
      const errMsg = `Unauthorized - ${validateSessionResponse.message}`
      span.setAttribute("error", true)
      span.setAttribute("error.message", errMsg)
      throw new RpcUnauthorizedException(errMsg)
    }

    const findOneUserResponse = await this.usersService.findOneById({id:validateSessionResponse.session.userId})
    if (!findOneUserResponse.user) {
      return { sessionId: "", user: null}
    }

    return { sessionId: validateSessionResponse.session.id, user: findOneUserResponse.user}
  }


  private async getRedisService(){
    const redisGrpcAddr = await this.registryService.discover("redis")
    return getRedisGrpcService(redisGrpcAddr).getService()
  }

  private generateSession(userId: number): CreateSessionRequest {
    const sessionId = uuid()
    
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
