import { SetKeyRequest } from "@ms/common/generated/redis";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class SetKeyDto implements SetKeyRequest {
    @IsString({message:"key must be a string"})
    @IsNotEmpty({message:"key is required"})
    key: string;

    @IsString({message:"value must be a string"})
    @IsNotEmpty({message:"value is required"})
    value: string;

    @IsNumber({},{message:"ttl must be a number"})
    ttl: number;
}