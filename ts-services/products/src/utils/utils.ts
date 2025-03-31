import { TypeOrmModule } from "@nestjs/typeorm"
import mysql from "mysql2/promise"

export async function createDBIfNotExist() {
    const dbConnObject = {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: Number(process.env.DB_PORT),
        host: process.env.DB_HOST,
    }

    if(process.env.DB_NAME) {
        const dbConn = await mysql.createConnection({
          ...dbConnObject
        })
    
        await dbConn.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`)
        await dbConn.end()
    }
}

export function createDatabaseModule() {
    return TypeOrmModule.forRootAsync({
          useFactory: async () => {
            await createDBIfNotExist();

            return {
              type: 'mysql',
              database: process.env.DB_NAME,
              username: process.env.DB_USER,
              password: process.env.DB_PASSWORD,
              port: Number(process.env.DB_PORT),
              host: process.env.DB_HOST,
              autoLoadEntities: true,
              synchronize: true,
            };
          },
    })
}