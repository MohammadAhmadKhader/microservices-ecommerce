import { Module } from "@nestjs/common";
import {initTracing} from "@ms/common/observability/telemetry"
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { GrpcInstrumentation } from '@opentelemetry/instrumentation-grpc';
import { Span, SpanStatusCode, Tracer } from "@opentelemetry/api";
import { EntitySubscriberInterface, EventSubscriber } from "typeorm";
import { User } from "./entities/user.entity";
import { AfterQueryEvent, BeforeQueryEvent } from "typeorm/subscriber/event/QueryEvent";
import { isBcryptHash } from "src/utils/utils";
import { serviceTracer } from "../auth/auth.telemetry";

function initTracingInstruments(provider: NodeTracerProvider) {
    registerInstrumentations({
        tracerProvider: provider,
        instrumentations:[new GrpcInstrumentation({
          ignoreGrpcMethods:["Check"]
      })]
    })
}

let usersTracer: Tracer
const redactString = "[REDACTED]"
const MicroserviceName = "auth"

const PROTONAME_USERS_SERVICE = "UsersService"

@Module({})
export class UsersTraceModule {
    constructor() {
        const provider = initTracing("auth")
        initTracingInstruments(provider)
 
        const tracer = provider.getTracer(PROTONAME_USERS_SERVICE)
        usersTracer = tracer
    }
}
 
@EventSubscriber()
export class UsersTelemtrySubsecriber implements EntitySubscriberInterface<User> {
    private spansMap = new Map<string, Span>()
    
    beforeQuery(event: BeforeQueryEvent<User>): Promise<any> | void {
      const opType: UserOperations = event.queryRunner.data.operationType
      const span = usersTracer.startSpan('database-query');
      span.setAttribute('db.statement', event.query);

      if(opType === "USER_CREATION" || opType === "USER_LOGIN") {
        span.setAttribute('db.operationType', opType);

        if (opType === "USER_CREATION" && event.parameters && typeof event.parameters[0] !== "number") {
            const redactedParameters = structuredClone(event.parameters) as UserCreationParameters
              if(redactedParameters && redactedParameters[3] && isBcryptHash(redactedParameters[3])) {
                redactedParameters[3] = redactString
                span.setAttribute('db.parameters', JSON.stringify(redactedParameters || []))

              } else {
                span.setAttribute('db.parameters', JSON.stringify(redactedParameters || []))
                span.setAttribute("error", true)
                span.setAttribute("db.redactingError", "4th parameter is expected to be a hash password and password was not found or not a hash")
              }
        } else if(event.parameters && event.parameters.length === 2 && opType === "USER_LOGIN") {
            const redactedParameters = structuredClone(event.parameters) as UserLoginParameters

            if(redactedParameters[1] && isBcryptHash(redactedParameters[1])) {
              redactedParameters[1] = redactString
              span.setAttribute('db.parameters', JSON.stringify(redactedParameters || []))

            } else {
              span.setAttribute('db.parameters', JSON.stringify(redactedParameters || []))
              span.setAttribute("error", true)
              span.setAttribute("db.redactingError", "4th parameter is expected to be a hash password and password was not found or not a hash")
            }
        }
        

      } else {
        span.setAttribute('db.parameters', JSON.stringify(event.parameters || []))
      }

      const spanId = crypto.randomUUID();
      event.queryRunner.data.customQuerySpanId = spanId
      this.spansMap.set(spanId, span)
    }

    afterQuery(event: AfterQueryEvent<User>): Promise<any> | void {
      const spanId = event.queryRunner.data.customQuerySpanId
      const span = this.spansMap.get(spanId);
      if (span) {
        if(event.error) {
          span.setAttribute("error", true)
          span.setAttribute("error.message", event.error?.message)
        }
        span.end();
        this.spansMap.delete(spanId);
      }
    }
}