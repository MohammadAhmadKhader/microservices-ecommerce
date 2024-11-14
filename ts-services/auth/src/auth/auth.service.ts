import { BadRequestException, Inject, Injectable, InternalServerErrorException, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import {ClientGrpc } from '@nestjs/microservices';
import { LoginResponse, RegistResponse, ValidateSessionResponse as AuthValidateSessionResponse} from '@ms/common/generated/auth';
import { EmptyBody} from '@ms/common/generated/shared';
import { comparePassword, hashPassword } from '../auth/utils/hash';
import { handleObservable } from '@ms/common/observable';
import { ObservableSessionsService, ObservableUsersService } from '../auth/utils/observables';

@Injectable()
export class AuthService implements OnModuleInit {
  private usersGrpcService : ObservableUsersService;
  private redisGrpcService : ObservableSessionsService;
  constructor(
    @Inject('users') private usersClient: ClientGrpc,
    @Inject('redis') private redisClient: ClientGrpc
  ) {}

  onModuleInit() {
    this.usersGrpcService = this.usersClient.getService<ObservableUsersService>('UsersService');
    this.redisGrpcService = this.redisClient.getService<ObservableSessionsService>("SessionsService");
  }

  async login(email:string, password: string): Promise<LoginResponse> {
    try{
      const userByEmailResp = await handleObservable(this.usersGrpcService.FindOneUserByEmail({email}))
      const user = userByEmailResp.user
      if (!user) {
        throw new BadRequestException("wrong email or password")
      }

      const isMatched = comparePassword(password, user.password)
      if (!isMatched) {
        throw new BadRequestException("wrong email or password")
      }

      const createSessionResponse = await handleObservable(this.redisGrpcService.CreateSession({userId:user.id}))

      return {user, sessionId: createSessionResponse.session.id};
    }catch(error) {
      console.error(error)
      throw error
    }
  }

  async regist(email:string, password: string, firstName: string, lastName:string): Promise<RegistResponse> {
    try{
      const userByEmailResp = await handleObservable(this.usersGrpcService.FindOneUserByEmail({email}))
      const user = userByEmailResp.user
      if (user) {
        throw new BadRequestException("User with such email already exists")
      }

      const hashedPassword = hashPassword(password)
      const createUserResponse = await handleObservable(this.usersGrpcService.CreateUser({
        email,
        firstName,
        lastName,
        password:hashedPassword,
      }))

      const createdUser = createUserResponse.user
      if (!createdUser) {
        throw new InternalServerErrorException("An unexpected error has occurred during creating user")
      }

      const createSessionResponse = await handleObservable(this.redisGrpcService.CreateSession({userId:createdUser.id}))
      if (!createSessionResponse.success) {
        throw new InternalServerErrorException(`${createSessionResponse.message}`)
      }

      return {user: createdUser, sessionId: createSessionResponse.session.id};
    }catch(error) {
      console.error(error)
      throw error
    }
  }

  async resetPassword(userId:number, oldPassword: string, newPassword: string, confirmNewPassword: string): Promise<EmptyBody> {
    try{
      // this logic must be moved to outside to a validator
      if (oldPassword == newPassword) {
        throw new BadRequestException("old and new password are same")
      }

      if (newPassword != confirmNewPassword) {
        throw new BadRequestException("new password and confirm new password must match")
      }
      const findUserResponse = await handleObservable(this.usersGrpcService.FindOneUserById({id:userId}))
      const user = findUserResponse.user
      const isMatching = comparePassword(oldPassword, user.password)
      if (!isMatching) {
        throw new BadRequestException("invalid password")
      }
      
      const hashedPassword = hashPassword(newPassword)
      await handleObservable(this.usersGrpcService.UpdateUser({id:user.id, password: hashedPassword}))

      return {};
    }catch(error) {
      console.error(error)
      throw error
    }
  }

  async validateSession(sessionId: string): Promise<AuthValidateSessionResponse> {
    try {
      const validateSessionResponse = await handleObservable(this.redisGrpcService.ValidateSession({sessionId:sessionId}))
      if (!validateSessionResponse.success) {
        throw new UnauthorizedException(`Unauthorized - ${validateSessionResponse.message}`)
      }

      const findOneUserResponse = await handleObservable(this.usersGrpcService.FindOneUserById({id:validateSessionResponse.session.userId}))
      if (!findOneUserResponse.user) {
        return { sessionId: "", user: null}
      }
      return { sessionId: validateSessionResponse.session.id, user: findOneUserResponse.user}
    }catch(error){
      console.error(error)
    }
  }
}
