import { Controller} from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { LoginRequest, RegistRequest, ResetPasswordRequest, ValidateSessionRequest } from '@ms/common/generated/auth';
import { CreateMetricsDecorator } from "@ms/common/modules/metrics/metrics.decorator"
import { MetricsService } from '@ms/common/modules/metrics/metrics.service';
import { appServicesMap } from './auth.module';

const AuthServiceName = "AuthService"
const Metrics = CreateMetricsDecorator(AuthServiceName, () => appServicesMap.get(MetricsService.name))

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @GrpcMethod(AuthServiceName, "Login")
  @Metrics("Login")
  async Login(LoginReq: LoginRequest) {
    return await this.authService.login(LoginReq.email, LoginReq.password);
  }

  @GrpcMethod(AuthServiceName, "Regist")
  @Metrics("Regist")
  async Regist(req: RegistRequest) {
    return await this.authService.regist(req.email, req.password, req.firstName, req.lastName);
  }

  @GrpcMethod(AuthServiceName, "ResetPassword")
  @Metrics("ResetPassword")
  async ResetPassword(req: ResetPasswordRequest) {
    return await this.authService.resetPassword(req.id, req.oldPassword ,req.newPassword, req.confirmNewPassword);
  }

  @GrpcMethod(AuthServiceName, "ValidateSession")
  @Metrics("ValidateSession")
  async ValidateSession(req: ValidateSessionRequest) {
    return await this.authService.validateSession(req.sessionId);
  }
}
