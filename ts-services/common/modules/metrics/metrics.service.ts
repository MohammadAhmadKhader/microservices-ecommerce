import { Injectable } from "@nestjs/common"
import {Counter, Registry, collectDefaultMetrics, Histogram, } from "prom-client"

// same as the golang services
const defaultBuckets = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]

/**
 * They can be used with InjectMetric from "@willsoto/nestjs-prometheus" package
 */
export const GRPC_REQUESTS_COUNTER_NAME = "grpc_ms_app_requests"
export const GRPC_REQUEST_DURATION_HISTOGRAM_NAME = "grpc_ms_app_request_duration_seconds"

@Injectable()
export class MetricsService {
    private registry: Registry;
    private requestCounter: Counter<string>;
    private requestDuration: Histogram<string>;

    constructor() {
        this.init()
        this.requestCounter = new Counter({
            name: GRPC_REQUESTS_COUNTER_NAME,
            help: "Grpc requests for microservices app",
            labelNames: ['service', 'method', 'status_code'],
        })

        this.requestDuration = new Histogram({
            name: GRPC_REQUEST_DURATION_HISTOGRAM_NAME,
            help: "Duration of gRPC requests in seconds",
            labelNames: ['service', 'method'],
            buckets: defaultBuckets
        });
        
        this.registry.registerMetric(this.requestCounter)
        this.registry.registerMetric(this.requestDuration);
    }

    private init() {
        this.registry = new Registry()
        collectDefaultMetrics({ register: this.registry })
    }

    incrementCounter(serviceName: string, method: string, statusCode: string) {
        this.requestCounter.labels(serviceName, method, statusCode).inc()
    }

    observeDuration(serviceName: string, method: string, duration: number) {
        this.requestDuration.labels(serviceName, method).observe(duration);
    }
    
    getMetrics() {
        return this.registry.metrics()
    }
}