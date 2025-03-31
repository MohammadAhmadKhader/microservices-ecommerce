import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../users/entities/user.entity";
import { createDatabaseModule } from "../../utils/utils";
import { SeederCommand } from "./cli.service";
import { CliLoggingService } from "./cli.logging-service";

@Module({
    imports:[
        createDatabaseModule(),
        TypeOrmModule.forFeature([User])
    ],
    providers:[SeederCommand, CliLoggingService]
})
export class UsersCliModule {}