import { DeleteKeyRequest } from "@ms/common/generated/redis";
import { IsNotEmpty, IsString } from "class-validator";

export class DeleteKeyDto implements DeleteKeyRequest {
    @IsString({message:"key must be a string"})
    @IsNotEmpty({message:"key is required"})
    key: string;
}