import { Controller, UseFilters, UseInterceptors} from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { GrpcMetricsInterceptor } from '@ms/common/modules/metrics/metrics.interceptor';
import { LoginDto } from './dto/login-dto';
import { LoggingInterceptor } from '@ms/common/observability/logger';
import { GenericExceptionFilter } from "@ms/common/exceptionFilters"
import { ValidateGrpcPayload } from "@ms/common/decorators"
import { RegisterDto } from './dto/register-dto';
import { ResetPasswordDto } from './dto/reset-password-dto';
import { ValidateSessionDto } from './dto/validate-session-dto';

const AuthServiceName = "AuthService"

@UseFilters(GenericExceptionFilter)
@UseInterceptors(GrpcMetricsInterceptor)
@UseInterceptors(new LoggingInterceptor(["password","oldPassword","newPassword","confirmNewPassword"]))
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @GrpcMethod(AuthServiceName, "Login")
  @ValidateGrpcPayload(LoginDto)
  async Login(req: LoginDto) {
    return await this.authService.login(req);
  }

  @GrpcMethod(AuthServiceName, "Regist")
  @ValidateGrpcPayload(RegisterDto)
  async Regist(req: RegisterDto) {
    return await this.authService.regist(req);
  }

  @GrpcMethod(AuthServiceName, "ResetPassword")
  @ValidateGrpcPayload(ResetPasswordDto)
  async ResetPassword(req: ResetPasswordDto) {
    return await this.authService.resetPassword(req);
  }

  @GrpcMethod(AuthServiceName, "ValidateSession")
  @ValidateGrpcPayload(ValidateSessionDto)
  async ValidateSession(req: ValidateSessionDto) {
    return await this.authService.validateSession(req);
  }
}
