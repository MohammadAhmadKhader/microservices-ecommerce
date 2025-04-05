import { GetKeyRequest } from "@ms/common/generated/redis";
import { IsNotEmpty, IsString } from "class-validator";

export class GetKeyDto implements GetKeyRequest {
    @IsString({message:"key must be a string"})
    @IsNotEmpty({message:"key is required"})
    key: string;
}