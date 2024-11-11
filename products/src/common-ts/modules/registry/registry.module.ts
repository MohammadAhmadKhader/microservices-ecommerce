import {Module} from "@nestjs/common"
import { ConsulService } from "./registry.service";

@Module({
    providers:[ConsulService]
})
export class ConsulModule{}