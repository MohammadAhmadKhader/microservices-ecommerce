import { Controller } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import { HealthCheckRequest, HealthCheckResponse, HealthCheckResponse_ServingStatus } from 'generated/health';

const HealthService = "Health"

@Controller()
export class HealthController {
  constructor() {}

  @GrpcMethod(HealthService, "Check")
  check(req: HealthCheckRequest): HealthCheckResponse {
    console.log("health checking", req)
    return { status:HealthCheckResponse_ServingStatus.SERVING};
  }
}
