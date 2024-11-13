import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { HealthCheckRequest, HealthCheckResponse, HealthCheckResponse_ServingStatus } from 'generated/health';

const HealthService = "Health"

@Controller()
export class HealthController {
  constructor() {}

  @GrpcMethod(HealthService, "Check")
  check(): HealthCheckResponse {
    console.log("health checking",)
    return { status:HealthCheckResponse_ServingStatus.SERVING};
  }
}
