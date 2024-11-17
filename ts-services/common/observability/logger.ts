import winston from "winston"
import {extractTraceParent} from "../utils"

const logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
)

export const logger = winston.createLogger({
    level:"info",
    format: logFormat,
    transports:[
        new winston.transports.Console(),
        new winston.transports.File({filename :"error.log", level:"error"}),
        new winston.transports.File({filename: "combined.log" })
    ]
})

export function MethodLogger() {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const method = descriptor.value

        descriptor.value = async function(...args:any[]) {
            const traceParent = extractTraceParent(target, propertyKey, ...args)

            try {
                logger.info(`${propertyKey} method`, {traceparent: traceParent || "null", args})
                const result = await method.apply(this, args)

                logger.info(`received: ${result}`, {traceparent: traceParent || "null"})
                return result 
            } catch (error : any) {
                logger.error(error.message, {traceparent: traceParent})
                throw error
            }
        }

        return descriptor
    }
}