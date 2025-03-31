import { Inject } from "@nestjs/common";
import { Command, CommandRunner, Option } from "nest-commander";
import { CliLoggingService } from "./cli.logging-service";
import { writeFile } from "fs/promises";
import data from "./data/data.json"
import { Repository } from "typeorm";
import { Product } from "../products/entities/product.entity";
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
        @InjectRepository(Product) private readonly productsRepository: Repository<Product>
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
        const products = await this.productsRepository.find()
        const data = { products }

        await writeFile(this.dataFilePath, JSON.stringify(data, null, 2))
        this.logger.log("syncing json with database was finished")
    }

    @Option({
        flags:"-sd, --sync-db",
        description:"adds the records/rows that exists in the json and does not exist in the database to the database"
    })
    async syncDBwithJSON() {
        this.logger.log("syncing db with json...")
        const products = await this.productsRepository.find()
        const dbProductsIdsMap = products.map((prod) => {
            return { [prod.id]: true }
        })

        const productsJSON = data.products
        productsJSON.forEach(async (prod) => {
            if(!dbProductsIdsMap[prod.id]) {
                await this.productsRepository.save(prod as any)
            }
        })
        this.logger.log("syncing db with json was finished")
    }
}