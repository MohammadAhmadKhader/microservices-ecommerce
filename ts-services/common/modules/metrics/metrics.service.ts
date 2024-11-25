import { Injectable } from "@nestjs/common"
import {Counter, Registry, register, collectDefaultMetrics,CounterConfiguration ,} from "prom-client"

@Injectable()
export class MetricsService {
    private registry: Registry;
    private requestCounter: Counter<string>;

    constructor(config: CounterConfiguration<string>) {
        this.init()
        this.requestCounter = new Counter({
            name: config.name,
            help: config.help,
        })
        

        this.registry.registerMetric(this.requestCounter)
    }

    private init() {
        this.registry = new Registry()
        collectDefaultMetrics({ register: this.registry})
    }

    incrementCounter() {
        console.log("incremented<----------------------------------------")
        this.requestCounter.inc()
    }
    
    getMetrics() {
        return this.registry.metrics()
    }
}