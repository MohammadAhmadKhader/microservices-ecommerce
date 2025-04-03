import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { GrpcInstrumentation } from '@opentelemetry/instrumentation-grpc';
import { initTracing } from '@ms/common/observability/telemetry';
import { Inject, Module } from '@nestjs/common';
import { Span, Tracer } from '@opentelemetry/api';
import { AfterQueryEvent, BeforeQueryEvent } from 'typeorm/subscriber/event/QueryEvent';
import { Product } from './entities/product.entity';
import { EntitySubscriberInterface, EventSubscriber, DataSource } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { LoggingService } from '@ms/common/modules/index';

export let serviceTracer: Tracer

function initTracingInstruments(provider: NodeTracerProvider) {
    registerInstrumentations({
        tracerProvider: provider,
        instrumentations: [
            new GrpcInstrumentation({
              ignoreGrpcMethods:["Check"]
          })
        ]
    });
}
const PRODUSTS_TRACER_NAME = "products-service"

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
    constructor(@Inject(DataSource) dataSource: DataSource, private logger: LoggingService) {
      dataSource.subscribers.push(this)
    }

    beforeQuery(event: BeforeQueryEvent<Product>): Promise<any> | void {
      this.logger.debug(`Executing query: ${event.query}`);
      traceingBeforeQuery(serviceTracer, event, this.spansMap)
    }

    afterQuery(event: AfterQueryEvent<Product>): Promise<any> | void {
      if (event.queryRunner?.isTransactionActive) {
        this.logger.debug(`Query executed within a transaction: ${event.query}`);
      } else {
        this.logger.debug(`Query executed: ${event.query}`);
      }

      tracingAfterQuery(event, this.spansMap)
    }
}

function traceingBeforeQuery(tracer: Tracer, event :BeforeQueryEvent<Product>, spansMap: Map<string, Span>) {
  const span = tracer.startSpan('database-query');
  span.setAttribute('db.statement', event.query);
  span.setAttribute('db.parameters', JSON.stringify(event.parameters || []));

  const spanId = uuid();
  event.queryRunner.data.customQuerySpanId = spanId
  spansMap.set(spanId, span);
}

function tracingAfterQuery(event :AfterQueryEvent<Product>, spansMap: Map<string, Span>) {
  const spanId = event.queryRunner.data.customQuerySpanId
  const span = spansMap.get(spanId);
  if (span) {
    if(event.error) {
      span.setAttribute("error", true)
      span.setAttribute("error.message", event.error?.message)
    }

    span.end();
    spansMap.delete(spanId);
  }
}