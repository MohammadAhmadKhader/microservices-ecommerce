import { registerAs } from "@nestjs/config";

const ServiceConfig = registerAs('service-config', () => {
    return {
        dbHost: process.env.DB_HOST,
        dbPort: Number(process.env.DB_PORT) || 3306,
        dbUser: process.env.DB_USER,
        dbName: process.env.DB_NAME,
        dbPassword: process.env.DB_PASSWORD,
        serviceHost: process.env.SERVICE_HOST,
        servicePort: Number(process.env.SERVICE_PORT),
        serviceUrl: process.env.SERVICE_HOST+":"+process.env.SERVICE_PORT,
        metricsPort: Number(process.env.METRICS_PORT),
        env: process.env.ENV || "production",
        isProduction: process.env.ENV === "production",
        logstashPort: Number(process.env.LOGSTASH_PORT),
        logstashHost: process.env.LOGSTASH_HOST
    }
});

export default ServiceConfig