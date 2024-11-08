import { Controller} from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { LoginRequest, RegistRequest, ResetPasswordRequest, ValidateSessionRequest } from 'generated/auth';

const AuthServiceName = "AuthService"

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @GrpcMethod(AuthServiceName, "Login")
  async Login(LoginReq: LoginRequest) {
    return await this.authService.login(LoginReq.email, LoginReq.password);
  }

  @GrpcMethod(AuthServiceName, "Regist")
  async Regist(req: RegistRequest) {
    return await this.authService.regist(req.email, req.password, req.firstName, req.lastName);
  }

  @GrpcMethod(AuthServiceName, "ResetPassword")
  async ResetPassword(req: ResetPasswordRequest) {
    return await this.authService.resetPassword(req.id, req.oldPassword ,req.newPassword, req.confirmNewPassword);
  }

  @GrpcMethod(AuthServiceName, "ValidateSession")
  async ValidateSession(req: ValidateSessionRequest) {
    return await this.authService.validateSession(req.sessionId);
  }


}
