import { Global, Module } from "@nestjs/common"
import { ConsulService } from "./registry.service";

@Global()
@Module({
    imports:[],
    providers:[ConsulService]
})
export class ConsulModule{}