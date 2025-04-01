import { registerAs } from "@nestjs/config";

export const INJECTION_TOKEN = 'service-config'
export type ServiceConfig = ReturnType<typeof ServiceConfig>

const ServiceConfig = registerAs(INJECTION_TOKEN, () => {
    return {
        redisPort: Number(process.env.REDIS_PORT) || 6379,
        redisHost: process.env.REDIS_HOST,
        redisPassword: process.env.REDIS_PASSWORD,
        serviceHost: process.env.SERVICE_HOST,
        servicePort: Number(process.env.SERVICE_PORT),
        serviceUrl: process.env.SERVICE_HOST+":"+process.env.SERVICE_PORT,
        metricsPort: Number(process.env.METRICS_PORT),
        env: process.env.ENV || "production",
        isProduction: process.env.ENV === "production",
        isDevelopment: process.env.ENV === "development",
        isStaging: process.env.ENV === "staging",
        logstashPort: Number(process.env.LOGSTASH_PORT),
        logstashHost: process.env.LOGSTASH_HOST
    }
});

export default ServiceConfig