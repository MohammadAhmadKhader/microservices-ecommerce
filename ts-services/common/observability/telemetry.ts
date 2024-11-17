import {NodeTracerProvider, SimpleSpanProcessor} from "@opentelemetry/sdk-trace-node"
import {OTLPTraceExporter} from "@opentelemetry/exporter-trace-otlp-http"
import { trace, propagation, context, Span } from "@opentelemetry/api"
import { Resource} from "@opentelemetry/resources"
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions'; // Use the recommended constant for service name
import {extractTraceParent} from "../utils"
import {W3CTraceContextPropagator} from "@opentelemetry/core"


export function initTracing(serviceName: string) {
    const provider = new NodeTracerProvider({
        resource:new Resource({
            [ATTR_SERVICE_NAME]: serviceName,

        }),
    })

    const exporter = new OTLPTraceExporter({
        url: process.env.OTEL_EXPORTER_URL || "http://localhost:4318/v1/traces",
    })
    
    provider.addSpanProcessor(new SimpleSpanProcessor(exporter))
    propagation.setGlobalPropagator(new W3CTraceContextPropagator());

    provider.register()
}


export function TraceMethod(tracerName : string, tracedMethod?: string) {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const method = descriptor.value

        const spanName = tracedMethod || propertyKey

        descriptor.value = async function(...args:any[]) {
            const traceParent = extractTraceParent(target, propertyKey, ...args)
            const tracer = trace.getTracer(tracerName)
            
            let span: Span
            
            if (traceParent) {
                const carrier = { traceparent: traceParent };
                
                const extractedContext = propagation.extract(context.active(), carrier)
                span = tracer.startSpan(spanName, undefined, extractedContext);
            } else {
                span = tracer.startSpan(spanName)
            }

            span.setAttribute("handler", propertyKey)

            try {
                const result = await method.apply(this, args)
                
                return result 
            } catch (error : any) {
                span.setAttribute("error", true)
                span.addEvent("message", {error:error.message})

                throw error
            } finally {
                span.end()
            }
        }

        return descriptor
    }
}