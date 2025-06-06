import { Inject } from "@nestjs/common";
import { Command, CommandRunner, Option } from "nest-commander";
import { CliLoggingService } from "./cli.logging-service";
import { writeFile, readFile } from "fs/promises";
import { Repository } from "typeorm";
import { Product } from "../products/entities/product.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { INJECTION_TOKEN, ServiceConfig } from "@src/config/config";
import { ConfigService } from "@nestjs/config";

interface SeedOptions {
    syncJson?: Promise<void>
    syncDb?: Promise<void>
}

interface JsonData {
    products: Product[]
}

@Command({
    name:"seed",
    description:"this command used to add initial data to the database",
})
export class SeederCommand extends CommandRunner {
    private dataFilePath = ""
    private dataDevFilePath = "./src/modules/cli/data/data.dev.json"
    private dataStagingFilePath = "./src/modules/cli/data/data.staging.json"
    private serviceCfg: ServiceConfig

    constructor(
        @Inject(CliLoggingService) private readonly logger: CliLoggingService,
        @InjectRepository(Product) private readonly productsRepository: Repository<Product>,
        private readonly configService: ConfigService
    ) {
        super()

        this.serviceCfg = this.configService.get<ServiceConfig>(INJECTION_TOKEN)

        if(this.serviceCfg.isDevelopment) {
            this.dataFilePath = this.dataDevFilePath
        } else if(this.serviceCfg.isStaging) {
            this.dataFilePath = this.dataStagingFilePath
        }
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
        flags:"-j, --sync-json",
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
        flags:"-d, --sync-db",
        description:"adds the records/rows that exists in the json and does not exist in the database to the database"
    })
    async syncDBwithJSON() {
        this.logger.log("syncing db with json...")
        const products = await this.productsRepository.find()
        const dbProductsIdsMap = products.map((prod) => {
            return { [prod.id]: true }
        })

        const data = await this.fetchData(this.dataFilePath)
        const productsJSON = data.products
        
        productsJSON.forEach(async (prod) => {
            if(!dbProductsIdsMap[prod.id]) {
                await this.productsRepository.save(prod as any)
            }
        })
        this.logger.log("syncing db with json was finished")
    }

    async fetchData(filePath: string) {
        const data = await readFile(filePath, "utf-8")
        const parstedData = JSON.parse(data) as JsonData
        return parstedData
    }
}