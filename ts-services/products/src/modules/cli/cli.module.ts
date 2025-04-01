import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "../products/entities/product.entity";
import { createDatabaseModule } from "../../utils/utils";
import { SeederCommand } from "./cli.service";
import { CliLoggingService } from "./cli.logging-service";
import { ConfigModule } from "@nestjs/config";
import ServiceConfig from "@src/config/config";

@Module({
    imports:[
        ConfigModule.forRoot({
            load:[ServiceConfig]
        }),
        createDatabaseModule(),
        TypeOrmModule.forFeature([Product])
    ],
    providers:[SeederCommand, CliLoggingService]
})
export class ProductsCLIModule {}