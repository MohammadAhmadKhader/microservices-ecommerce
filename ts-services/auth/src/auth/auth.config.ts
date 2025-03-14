import { registerAs } from "@nestjs/config";

const ServiceConfig = registerAs("service-config", () => {
    return {
        dbHost: process.env.DB_HOST,
        dbPort: process.env.DB_PORT || 3306,
        dbUser: process.env.DB_USER,
        dbName: process.env.DB_NAME,
        dbPassword: process.env.DB_PASSWORD,
        serviceHost: process.env.SERVICE_HOST,
        servicePort: process.env.SERVICE_PORT,
        serviceUrl: process.env.SERVICE_HOST+":"+process.env.SERVICE_PORT,
        sessionSecret: process.env.SESSION_SECRET,
    }
})

export default ServiceConfig