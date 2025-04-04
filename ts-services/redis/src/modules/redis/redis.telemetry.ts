import { Module } from "@nestjs/common";
import { initTracing} from "@ms/common/observability/telemetry"
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { GrpcInstrumentation } from '@opentelemetry/instrumentation-grpc';
import { Tracer } from "@opentelemetry/api";

function initTracingInstruments(provider: NodeTracerProvider) {
    registerInstrumentations({
        tracerProvider: provider,
        instrumentations:[new GrpcInstrumentation({
            ignoreGrpcMethods:["Check"]
        })]
    })
}

export let serviceTracer: Tracer

const REDIS_TRACER_NAME = "redis-service"

@Module({})
export class TraceModule {
    constructor() {
        const provider = initTracing("redis")
        initTracingInstruments(provider)

        const tracer = provider.getTracer(REDIS_TRACER_NAME)
        serviceTracer = tracer
    }
}