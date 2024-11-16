import { BadRequestException, Inject, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { LoginResponse, RegistResponse, ValidateSessionResponse as AuthValidateSessionResponse} from '@ms/common/generated/auth';
import { EmptyBody} from '@ms/common/generated/shared';
import { comparePassword, hashPassword } from '../auth/utils/hash';
import { handleObservable } from '@ms/common/utils';
import {getRedisGrpcService, getUsersGrpcService} from "@ms/common/grpc"
import { ConsulService } from '@ms/common/modules/registry/registry.service';

@Injectable()
export class AuthService {
  constructor(@Inject(ConsulService) private registryService: ConsulService) {}

  async login(email:string, password: string): Promise<LoginResponse> {
    const usersService = await this.getUsersService()

    const userByEmailResp = await handleObservable(usersService.FindOneUserByEmail({email}))
    const user = (userByEmailResp as any).user
    if (!user) {
      throw new BadRequestException("wrong email or password")
    }

    const isMatched = comparePassword(password, user.password)
    if (!isMatched) {
      throw new BadRequestException("wrong email or password")
    }

    const redisService = await this.getRedisService()

    const createSessionResponse = await handleObservable(redisService.CreateSession({userId:user.id}))
    return {user, sessionId: createSessionResponse.session.id};
  }

  async regist(email:string, password: string, firstName: string, lastName:string): Promise<RegistResponse> {
    const usersService = await this.getUsersService()

    const userByEmailResp = await handleObservable(usersService.FindOneUserByEmail({email}))
    const user = userByEmailResp.user
    if (user) {
      throw new BadRequestException("User with such email already exists")
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
      throw new InternalServerErrorException("An unexpected error has occurred during creating user")
    }
    
    const redisService = await this.getRedisService()

    const createSessionResponse = await handleObservable(redisService.CreateSession({userId:createdUser.id}))
    if (!createSessionResponse.success) {
      throw new InternalServerErrorException(`${createSessionResponse.message}`)
    }

    return {user: createdUser, sessionId: createSessionResponse.session.id};
  }

  async resetPassword(userId:number, oldPassword: string, newPassword: string, confirmNewPassword: string): Promise<EmptyBody> {
    // this logic must be moved to outside to a validator
    if (oldPassword == newPassword) {
      throw new BadRequestException("old and new password are same")
    }

    if (newPassword != confirmNewPassword) {
      throw new BadRequestException("new password and confirm new password must match")
    }
    
    const usersService = await this.getUsersService()

    const findUserResponse = await handleObservable(usersService.FindOneUserById({id:userId}))
    const user = findUserResponse.user
    const isMatching = comparePassword(oldPassword, user.password)
    if (!isMatching) {
      throw new BadRequestException("invalid password")
    }
    const hashedPassword = hashPassword(newPassword)
    await handleObservable(usersService.UpdateUser({id:user.id, password: hashedPassword}))

    return {};
  }

  async validateSession(sessionId: string): Promise<AuthValidateSessionResponse> {
    const redisService = await this.getRedisService()
    const validateSessionResponse = await handleObservable(redisService.ValidateSession({sessionId:sessionId}))
    if (!validateSessionResponse.success) {
      throw new UnauthorizedException(`Unauthorized - ${validateSessionResponse.message}`)
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
    console.log(usersGrpcAddr)
    return getUsersGrpcService(usersGrpcAddr).getService()
  }
}
