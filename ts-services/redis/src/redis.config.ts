import { registerAs } from "@nestjs/config";

const ServiceConfig = registerAs('service-config', () => {
    return {
        redisPort: Number(process.env.REDIS_PORT) || 6379,
        redisHost: process.env.REDIS_HOST,
        redisPassword: process.env.REDIS_PASSWORD,
        serviceHost: process.env.SERVICE_HOST,
        servicePort: Number(process.env.SERVICE_PORT),
        serviceUrl: process.env.SERVICE_HOST+":"+process.env.SERVICE_PORT,
        metricsPort: Number(process.env.METRICS_PORT)
    }
});

export default ServiceConfig