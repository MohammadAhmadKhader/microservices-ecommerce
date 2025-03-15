import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { GrpcInstrumentation } from '@opentelemetry/instrumentation-grpc';
import { GetTraceMethodDecorator, initTracing } from '@ms/common/observability/telemetry';
import { Module } from '@nestjs/common';
import { context, Span, trace, Tracer } from '@opentelemetry/api';
import { AfterQueryEvent, BeforeQueryEvent } from 'typeorm/subscriber/event/QueryEvent';
import { Product } from './entities/product.entity';
import { EntitySubscriberInterface, EventSubscriber } from 'typeorm';

export let serviceTracer: Tracer

function initTracingInstruments(provider: NodeTracerProvider) {
    registerInstrumentations({
        tracerProvider: provider,
        instrumentations: [
            new GrpcInstrumentation()
        ]
    });
}
const PRODUSTS_TRACER_NAME = "products-service"
export const TraceMethod = GetTraceMethodDecorator()

@Module({})
export class TraceModule {
  constructor() {
    const provider = initTracing("products")
    const tracer = provider.getTracer(PRODUSTS_TRACER_NAME);
    serviceTracer = tracer

    initTracingInstruments(provider)
  }
}

@EventSubscriber()
export class ProductTelemetrySubscriber implements EntitySubscriberInterface<Product> {
    private spansMap = new Map<string, Span>()
    
    beforeQuery(event: BeforeQueryEvent<Product>): Promise<any> | void {
      const span = serviceTracer.startSpan('database-query');
      span.setAttribute('db.statement', event.query);
      span.setAttribute('db.parameters', JSON.stringify(event.parameters || []));

      const spanId = crypto.randomUUID();
      event.queryRunner.data.customQuerySpanId = spanId
      this.spansMap.set(spanId, span);
    }

    afterQuery(event: AfterQueryEvent<Product>): Promise<any> | void {
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