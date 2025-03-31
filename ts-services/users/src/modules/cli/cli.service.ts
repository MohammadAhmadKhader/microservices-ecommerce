import { Inject } from "@nestjs/common";
import { Command, CommandRunner, Option } from "nest-commander";
import { CliLoggingService } from "./cli.logging-service";
import { writeFile } from "fs/promises";
import data from "./data/data.json"
import { Repository } from "typeorm";
import { User } from "../users/entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";

interface SeedOptions {
    syncJson?: Promise<void>
    syncDb?: Promise<void>
}

@Command({
    name:"seed",
    description:"this command used to add initial data to the database",
})
export class SeederCommand extends CommandRunner {
    private dataFilePath = "./src/modules/cli/data/data.json"

    constructor(
        @Inject(CliLoggingService) private readonly logger: CliLoggingService,
        @InjectRepository(User) private readonly usersRepository: Repository<User>
    ) {
        super()
    }

    async run(passedParams: string[], options?: SeedOptions): Promise<void> {
        if(options.syncJson) {
            await options.syncJson
        }

        if(options.syncDb) {
            await options.syncDb
        }
    }
    
    @Option({
        flags:"-sj, --sync-json",
        description:"replaces the data in the json file with the one in the database"
    })
    async syncJSONwithDB() {
        this.logger.log("syncing json with database...")
        const users = await this.usersRepository.find()
        const data = { users }

        await writeFile(this.dataFilePath, JSON.stringify(data, null, 2))
        this.logger.log("syncing json with database was finished")
    }

    @Option({
        flags:"-sd, --sync-db",
        description:"adds the records/rows that exists in the json and does not exist in the database to the database"
    })
    async syncDBwithJSON() {
        this.logger.log("syncing db with json...")
        const users = await this.usersRepository.find()
        const dbUsersIdsMap = users.map((user) => {
            return { [user.id]: true }
        })

        const usersJSON = data.users
        usersJSON.forEach(async (user) => {
            if(!dbUsersIdsMap[user.id]) {
                await this.usersRepository.save(user as any)
            }
        })
        this.logger.log("syncing db with json was finished")
    }
}