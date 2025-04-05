import { ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { INJECTION_TOKEN, ServiceConfig } from '@src/config/config';
import { Client } from 'pg';

export async function createDbIfNotExist(cfg: ServiceConfig) {
    const client = new Client({
        host: cfg.dbHost,
        port: cfg.dbPort,
        user: cfg.dbUser,
        password: cfg.dbPassword,
        query_timeout:5000,
        
    });

    await client.connect()

    const res = await client.query("SELECT 1 FROM pg_database WHERE datname = $1;", [cfg.dbName]);
    if (res.rowCount === 0) {
      await client.query(`CREATE DATABASE "${cfg.dbName}";`);
      console.log("database was created successfully")
    }

    await client.end()
}

export function createDbModule(subescribers?: TypeOrmModuleOptions["subscribers"]) {
  return TypeOrmModule.forRootAsync({
        inject:[ConfigService],
        useFactory:async (configureService: ConfigService) =>{
          const cfg = configureService.get<ServiceConfig>(INJECTION_TOKEN)
          await createDbIfNotExist(cfg)
  
          return {
            type:"postgres",
            database: cfg.dbName,
            username: cfg.dbUser,
            password: cfg.dbPassword,
            port: cfg.dbPort,
            host: cfg.dbHost,
            autoLoadEntities:true,
            logging:true,
            synchronize:true,
            subscribers: (subescribers as [])?.length > 0 ? [...(subescribers as any)] : []
          }
        }
  })
}

export function isBcryptHash(str: string) {
  const bcryptRegex = /^\$2[ayb]\$[0-9]{2}\$.{53}$/;
  return bcryptRegex.test(str);
};