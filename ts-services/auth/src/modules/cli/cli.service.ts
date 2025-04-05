import { Inject } from "@nestjs/common";
import { Command, CommandRunner, Option, SubCommand } from "nest-commander";
import { CliLoggingService } from "./cli.logging-service";
import { writeFile, readFile } from "fs/promises";
import { Repository } from "typeorm";
import { User } from "../users/entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { INJECTION_TOKEN, ServiceConfig } from "@src/config/config";
import { ConfigService } from "@nestjs/config";
import { Role } from "../roles/entities/role.entity";
import { Permission } from "../permissions/entities/permission.entity";
import { UserRole } from "../users/entities/userRole.entity";
import { RolePermission } from "../roles/entities/rolePermission.entity";
import { hashPassword } from "@src/utils/hash";

interface SeedOptions {
    syncJson?: Promise<void>
    syncDb?: Promise<void>
}

interface JsonData {
    users: User[]
}

type Schema = "users" | "roles" | "permissions" | "rolePermission" | "userRole" | "all"

@Command({
    name:"seed",
    description:"this command used to add initial data to the database"
})
export class SeederCommand extends CommandRunner {
    private dataFilePath = ""
    private dataDevFilePath = "./src/modules/cli/data/data.dev.json"
    private dataStagingFilePath = "./src/modules/cli/data/data.staging.json"
    private serviceCfg: ServiceConfig
    private schema: Schema

    constructor(
        @Inject(CliLoggingService) private readonly logger: CliLoggingService,
        @InjectRepository(User) private readonly usersRepository: Repository<User>,
        @InjectRepository(Role) private readonly rolesRepository: Repository<Role>,
        @InjectRepository(Permission) private readonly permissionsRepository: Repository<Permission>,
        @InjectRepository(UserRole) private readonly usersRoleRepository: Repository<UserRole>,
        @InjectRepository(RolePermission) private readonly rolesPermissions: Repository<RolePermission>,
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
        console.log(passedParams,"passed params")
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
    async syncOneSchemaWithDb() {
        if(this.schema === "all") {
            throw new Error("invalid option for syncing json")
        }

        this.logger.log(`syncing ${this.schema} with database...`)
        let arrayOfItems: any
        if(this.schema === "users") {
            arrayOfItems = await this.usersRepository.find()
        } else if(this.schema === "roles") {
            arrayOfItems = await this.rolesRepository.find()
        } else if(this.schema === "permissions") {
            arrayOfItems = await this.permissionsRepository.find()
        } else if(this.schema === "rolePermission") {
            arrayOfItems = await this.rolesPermissions.find()
        } else if(this.schema === "userRole") {
            arrayOfItems = await this.usersRoleRepository.find()
        } else {
            this.logger.error(`invalid schema received: '${this.schema}'`)
            return
        }

        const data = await this.fetchData(this.dataFilePath)
        data[this.schema] = arrayOfItems;

        await writeFile(this.dataFilePath, JSON.stringify(data, null, 2))
        this.logger.log(`syncing ${this.schema} with database was finished`)
    }

    @Option({
        flags:"-d, --sync-db",
        description:"adds the records/rows that exists in the json and does not exist in the database to the database"
    })
    async syncDBwithJSON() {
        this.logger.log("syncing db with json...")
        if(this.schema === "rolePermission"){
            await this.migrateRolePermissionToDb()

        } else if(this.schema === "userRole") {
            await this.migrateUserRoleToDb()

        } else if(this.schema === "users") {
            await this.migrateUsersToDb()

        } else if(this.schema === "permissions"){
            await this.migratePermissionsToDb()

        } else if(this.schema === "roles"){
            await this.migrateRolesToDb()

        } else if(this.schema === "all"){
            this.logger.log("syncing permissions ...")
            await this.migratePermissionsToDb()

            this.logger.log("syncing roles ...")
            await this.migrateRolesToDb()

            this.logger.log("syncing rolePermissions ...")
            await this.migrateRolePermissionToDb()

            this.logger.log("syncing users ...")
            await this.migrateUsersToDb()

            this.logger.log("syncing userRoles ...")
            await this.migrateUserRoleToDb()
        } else {
            this.logger.error(`invalid schema received: '${this.schema}'`)
            return
        } 

        this.logger.log("syncing db with json was finished")
    }

    @Option({
        flags:"-s, --schema <schema>",
        description:"which schema to sync",
        choices:["users", "roles", "permissions", "userRole", "rolePermission", "all"] as Schema[],
        required: true,
        name:"schema"
    })
    async schemaSelector(schema: Schema) {
        this.logger.log(`selected schema is: ${schema}`)
        this.schema = schema
        return schema
    }
    
    async migrateRolePermissionToDb() {
        const data = await this.fetchData(this.dataFilePath)
        const rolesPermissionJSON = data["rolePermission"] as RolePermission[]

        const processPromises = async () => {
            for(const jsonRolePermission of rolesPermissionJSON) {
                const exists = await this.rolesPermissions.exists({
                    where:{
                        roleId:jsonRolePermission.roleId,
                        permissionId:jsonRolePermission.permissionId
                    }
                })

                if(!exists) {
                    await this.rolesPermissions.save(jsonRolePermission)
                }
            }
        }

        await processPromises()
    }

    async migrateUserRoleToDb() {
        const data = await this.fetchData(this.dataFilePath)
        const userRolesJSON = data["userRole"] as UserRole[]
            
        const processPromises = async () => {
            for(const jsonUserRole of userRolesJSON) {
                const exists = await this.usersRoleRepository.exists({
                    where:{
                        roleId:jsonUserRole.roleId,
                        userId:jsonUserRole.userId
                    }
                })

                if(!exists) {
                    await this.usersRoleRepository.save(jsonUserRole)
                }
            }
        }

        await processPromises()
    }

    async migrateUsersToDb() {
        const data = await this.fetchData(this.dataFilePath)
        const usersJSON = data["users"] as User[]
            
        const processPromises = async () => {
            for(const jsonUser of usersJSON) {
                const exists = await this.usersRepository.exists({
                    where:[
                        {
                            id: jsonUser.id
                        },
                        {
                            email: jsonUser.email
                        }
                    ]
                })

                if(!exists) {
                    jsonUser.password = hashPassword(this.serviceCfg.testingPassword) 
                    await this.usersRepository.save(jsonUser)
                }
            }
        }

        await processPromises()
    }

    async migratePermissionsToDb() {
        const data = await this.fetchData(this.dataFilePath)
        const permissionsJSON = data["permissions"] as Permission[]
            
        const processPromises = async () => {
            for(const jsonPermission of permissionsJSON) {
                const exists = await this.permissionsRepository.exists({
                    where:[{
                        id: jsonPermission.id
                    },
                    {
                        name: jsonPermission.name
                    }]
                })

                if(!exists) {
                    await this.permissionsRepository.save(jsonPermission)
                }
            }
        }

        await processPromises()
    }

    async migrateRolesToDb() {
        const data = await this.fetchData(this.dataFilePath)
        const rolesJSON = data["roles"] as Role[]
            
        const processPromises = async () => {
            for(const jsonRole of rolesJSON) {
                const exists = await this.rolesRepository.exists({
                    where:[{
                       id: jsonRole.id
                    },{
                        name: jsonRole.name
                    }]
                })

                if(!exists) {
                    await this.rolesRepository.save(jsonRole)
                }
            }
        }

        await processPromises()
    }

    async fetchData(filePath: string) {
        const data = await readFile(filePath, "utf-8")
        const parstedData = JSON.parse(data) as JsonData
        return parstedData
    }
}