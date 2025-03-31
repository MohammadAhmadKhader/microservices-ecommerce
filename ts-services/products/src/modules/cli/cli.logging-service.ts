import { Injectable } from "@nestjs/common";
import winston from "winston";

@Injectable()
export class CliLoggingService {
    private readonly logger: winston.Logger;
    
    constructor() {
        this.logger = winston.createLogger({
          level: "info",
          transports: [
            new winston.transports.Console(),
          ],
        });
    }
    
    log(message = "", ...meta: any[]): void {
        this.logger.info(message, ...meta);
    }
    
    error(message = "", ...meta: any[]): void {
        this.logger.error(message, ...meta);
    }
    
    warn(message = "", ...meta: any[]): void {
        this.logger.warn(message, ...meta);
    }
    
    debug(message = "", ...meta: any[]): void {
        this.logger.debug(message, ...meta);
    }
}