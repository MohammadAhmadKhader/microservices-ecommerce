import { Inject, Injectable } from '@nestjs/common';
import { LoginResponse, RegistResponse, ValidateSessionResponse as AuthValidateSessionResponse} from '@ms/common/generated/auth';
import { EmptyBody} from '@ms/common/generated/shared';
import { comparePassword, hashPassword } from '../auth/utils/hash';
import { handleObservable } from '@ms/common/utils';
import {getRedisGrpcService, getUsersGrpcService} from "@ms/common/grpc"
import { ConsulService } from '@ms/common/modules/registry/registry.service';
import { TraceMethod } from './telemetry';
import { SpanStatusCode, trace } from '@opentelemetry/api';
import { RpcAlreadyExistsException, RpcInternalException, RpcInvalidArgumentException, RpcUnauthorizedException } from "@ms/common/rpcExceprions"

@Injectable()
export class AuthService {
  constructor(@Inject(ConsulService) private registryService: ConsulService) {}

  @TraceMethod()
  async login(email:string, password: string): Promise<LoginResponse> {
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
    const createSessionResponse = await handleObservable(redisService.CreateSession({userId:user.id}))
    
    return {user, sessionId: createSessionResponse.session.id};
  }

  @TraceMethod()
  async regist(email:string, password: string, firstName: string, lastName:string): Promise<RegistResponse> {
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

    const createSessionResponse = await handleObservable(redisService.CreateSession({userId:createdUser.id}))
    if (!createSessionResponse.success) {
      throw new RpcInternalException(createSessionResponse.message)
    }

    span.setStatus({code: SpanStatusCode.OK})
    return {user: createdUser, sessionId: createSessionResponse.session.id};
  }

  @TraceMethod()
  async resetPassword(userId:number, oldPassword: string, newPassword: string, confirmNewPassword: string): Promise<EmptyBody> {
    // this logic must be moved to outside to a validator
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
  async validateSession(sessionId: string): Promise<AuthValidateSessionResponse> {
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
}
