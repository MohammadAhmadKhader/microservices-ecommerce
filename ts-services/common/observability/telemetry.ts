import {NodeTracerProvider, SimpleSpanProcessor} from "@opentelemetry/sdk-trace-node"
import {OTLPTraceExporter} from "@opentelemetry/exporter-trace-otlp-http"
import { trace, propagation, context, Span, Tracer, SpanStatusCode } from "@opentelemetry/api"
import { Resource, ResourceAttributes} from "@opentelemetry/resources"
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions'; // Use the recommended constant for service name
import {W3CTraceContextPropagator} from "@opentelemetry/core"

export function initTracing(serviceName: string, globalAttrs?: ResourceAttributes) {
    const provider = new NodeTracerProvider({
        resource:new Resource({
            [ATTR_SERVICE_NAME]: serviceName,
            ...globalAttrs
        }),
    })

    const exporter = new OTLPTraceExporter({
        url: process.env.OTEL_EXPORTER_URL || "http://localhost:4318/v1/traces",
    })
    const spanProcessor = new SimpleSpanProcessor(exporter)
    // for production we will use BatchSpanProcessor
  
    provider.addSpanProcessor(spanProcessor)
    propagation.setGlobalPropagator(new W3CTraceContextPropagator());

    provider.register()

    return provider
}

export function TraceMethod() {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const method = descriptor.value

        descriptor.value = async function(...args:any[]) {
            const span = trace.getActiveSpan()
            span.setAttribute("handler", propertyKey)

            try {
                const result = await method.apply(this, args)
                span.setStatus({
                    code: SpanStatusCode.OK
                })
                return result

            } catch (error : any) {
                span.setAttribute("error", true)
                span.setAttribute("error.message", error.message)
                throw error

            } finally {
                span.end()
            }
        }
        return descriptor
    }
}