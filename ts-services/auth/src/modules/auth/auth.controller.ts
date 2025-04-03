import { Controller, UseFilters, UseInterceptors} from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login-dto';
import { GrpcMetricsInterceptor, LoggingInterceptor, RedactKeys, TraceMethod } from '@ms/common';
import { GenericExceptionFilter } from "@ms/common/exceptionFilters"
import { ValidateGrpcPayload } from "@ms/common/decorators"
import { RegisterDto } from './dto/register-dto';
import { ResetPasswordDto } from './dto/reset-password-dto';
import { ValidateSessionDto } from './dto/validate-session-dto';
import { AuthServiceServiceName } from '@ms/common/generated/auth';

export const AuthServiceName = AuthServiceServiceName.split(".")[1]

@UseFilters(GenericExceptionFilter)
@UseInterceptors(GrpcMetricsInterceptor)
@UseInterceptors(LoggingInterceptor)
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @RedactKeys(["password"])
  @GrpcMethod(AuthServiceName, "Login")
  @ValidateGrpcPayload(LoginDto)
  @TraceMethod()
  async Login(req: LoginDto) {
    return await this.authService.login(req);
  }

  @RedactKeys(["password"])
  @GrpcMethod(AuthServiceName, "Regist")
  @ValidateGrpcPayload(RegisterDto)
  @TraceMethod()
  async Regist(req: RegisterDto) {
    return await this.authService.regist(req);
  }

  @RedactKeys(["oldPassword", "newPassword", "confirmNewPassword"])
  @GrpcMethod(AuthServiceName, "ResetPassword")
  @ValidateGrpcPayload(ResetPasswordDto)
  @TraceMethod()
  async ResetPassword(req: ResetPasswordDto) {
    return await this.authService.resetPassword(req);
  }

  @GrpcMethod(AuthServiceName, "ValidateSession")
  @ValidateGrpcPayload(ValidateSessionDto)
  @TraceMethod()
  async ValidateSession(req: ValidateSessionDto) {
    return await this.authService.validateSession(req);
  }
}
