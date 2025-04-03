import { Global, Module } from "@nestjs/common";
import { initTracing} from "@ms/common/observability/telemetry"
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { GrpcInstrumentation } from '@opentelemetry/instrumentation-grpc';
import { Tracer } from "@opentelemetry/api";

export let serviceTracer: Tracer

function initTracingInstruments(provider: NodeTracerProvider) {
    registerInstrumentations({
        tracerProvider: provider,
        instrumentations:[
            new GrpcInstrumentation({
                ignoreGrpcMethods:["Check"],
            }),
        ] 
    })
}

const AUTH_TRACER_NAME = "auth-service"

@Global()
@Module({})
export class TraceModule {
    constructor() {
        const provider = initTracing("auth")
        const tracer = provider.getTracer(AUTH_TRACER_NAME)
        serviceTracer = tracer

        initTracingInstruments(provider)
        provider.register()
    }
}