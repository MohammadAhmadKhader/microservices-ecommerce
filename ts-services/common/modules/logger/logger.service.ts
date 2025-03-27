import { Injectable } from "@nestjs/common";
import winston from "winston"
import LogstashTransport from "winston-logstash/lib/winston-logstash-latest.js"

// *TODO:
// this is bugged throws "common.log is not a function" error must be reworked later, better to be another package, 
// using 'winston-logstash/lib/winston-logstash-latest.js' instead of import {Logstash as LogstashTransport} from 'winston-logstash';
// has fixed the error.

interface LoggingServiceOptions {
    service: string;
    username: string;   
    password: string;
    logstashHost: string,
    logstashPort: number,
    isProduction: boolean;
}

@Injectable()
export class LoggingService {
    private logger: winston.Logger
    private defaultOptions: LoggingServiceOptions = {
        logstashHost: "localhost",
        logstashPort: 5000,
        service:"Unknown",
        username:"",
        password:"",
        isProduction: true
    }
    private service: string

    constructor(options: LoggingServiceOptions) {
        this.service = options.service
        const customizedOptions = {...this.defaultOptions, ...options}

        const logFormat = winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(customizedOptions.isProduction ? undefined: {
                space:2
            }),
        );
        
        const logstashTransport = new LogstashTransport({
            host: customizedOptions.logstashHost,
            port: customizedOptions.logstashPort,
        })

        const logger = winston.createLogger({
            level: 'info',
            format: logFormat,
            transports: [
              new winston.transports.Console(),
              logstashTransport,
            ],
            defaultMeta: { service: this.service },
        });

        this.logger = logger
    }

    info(message: string, metadata?: object) {
        this.logger.info({ message, ...metadata });
    }

    error(message: string, metadata?: object) {
        this.logger.error({ message, ...metadata });
    }

    warn(message: string, metadata?: object) {
        this.logger.warn({ message, ...metadata });
    }

    debug(message: string, metadata?: object) {
        this.logger.debug({ message, ...metadata });
    }
}