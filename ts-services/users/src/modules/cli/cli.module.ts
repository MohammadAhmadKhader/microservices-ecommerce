import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../users/entities/user.entity";
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
        TypeOrmModule.forFeature([User])
    ],
    providers:[SeederCommand, CliLoggingService]
})
export class UsersCliModule {}