import { registerAs } from "@nestjs/config";

export const INJECTION_TOKEN = 'service-config'
export type ServiceConfig = ReturnType<typeof ServiceConfig>

const ServiceConfig = registerAs(INJECTION_TOKEN, () => {
    return {
        dbHost: process.env.DB_HOST,
        dbPort: Number(process.env.DB_PORT),
        dbUser: process.env.DB_USER,
        dbName: process.env.DB_NAME,
        dbPassword: process.env.DB_PASSWORD,
        serviceHost: process.env.SERVICE_HOST,
        servicePort: Number(process.env.SERVICE_PORT),
        serviceUrl: process.env.SERVICE_HOST+":"+process.env.SERVICE_PORT,
        metricsPort: Number(process.env.METRICS_PORT),
        env: process.env.NODE_ENV || "production",
        isProduction: process.env.NODE_ENV === "production",
        isDevelopment: process.env.NODE_ENV === "development",
        isStaging: process.env.NODE_ENV === "staging",
        logstashPort: Number(process.env.LOGSTASH_PORT),
        logstashHost: process.env.LOGSTASH_HOST,
        cookieMaxAge: Number(process.env.COOKIE_MAXAGE),
        testingPassword: process.env.TESTING_PASSWORD,
    }
});

export default ServiceConfig
