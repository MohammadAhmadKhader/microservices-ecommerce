import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../users/entities/user.entity";
import { createDbModule } from "../../utils/utils";
import { SeederCommand } from "./cli.service";
import { CliLoggingService } from "./cli.logging-service";
import { ConfigModule } from "@nestjs/config";
import ServiceConfig from "@src/config/config";
import { Permission } from "../permissions/entities/permission.entity";
import { Role } from "../roles/entities/role.entity";

@Module({
    imports:[
        ConfigModule.forRoot({
            load:[ServiceConfig]
        }),
        createDbModule(),
        TypeOrmModule.forFeature([User, Role, Permission])
    ],
    providers:[SeederCommand, CliLoggingService]
})
export class AuthCliModule {}