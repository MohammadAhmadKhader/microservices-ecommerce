import { CreateSessionRequest } from "@ms/common/generated/redis"
import {Min, IsNotEmpty, IsNumber} from "class-validator"

export class CreateSessionDto implements CreateSessionRequest {
    @Min(1, {message:"userId must be at least 1"})
    @IsNotEmpty({message:"userId is required"})
    @IsNumber({}, {message:"userId must be a number"})
    userId: number
}