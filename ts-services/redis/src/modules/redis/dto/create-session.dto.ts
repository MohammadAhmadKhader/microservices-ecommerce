import { CreateSessionRequest } from "@ms/common/generated/redis"
import {Min, IsNotEmpty, IsNumber, IsString, IsUUID, IsBoolean, ValidateNested} from "class-validator"
import { Type } from 'class-transformer';
import { Transform } from 'class-transformer';
import { IsLong } from "@ms/common/utils";
import { Long } from "@grpc/proto-loader";

class Session {
    @IsUUID("4",{message:"sessionId is invalid uuid"})
    @IsString({message:"sessionId must be a number"})
    @IsNotEmpty({message:"sessionId is required"})
    id: string;

    @Min(1, {message:"userId must be at least 1"})
    @IsNotEmpty({message:"userId is required"})
    @IsNumber({}, {message:"userId must be a number"})
    userId: number

    @IsNotEmpty({message:"createdAt is required"})
    @IsNumber({}, {message:"createdAt must be a number"})
    @Transform(({ value }) => {
        if(Long.isLong(value)) {
            return (value as Long).toNumber()
        }
        
        return value
    }, {toClassOnly: true})
    createdAt: number;

    @IsNotEmpty({message:"expiresAt is required"})
    @Min(Date.now(), {message:"expiresAt must be at least more than the current time"})
    @IsNumber({}, {message:"expiresAt must be a number"})
    @Transform(({ value }) => {
        if(Long.isLong(value)) {
            return (value as Long).toNumber()
        }

        return value
    }, {toClassOnly: true})
    expiresAt: number;

    @IsNotEmpty({message:"cookieMaxAge is required"})
    @IsNumber({}, {message:"cookieMaxAge must be a number"})
    cookieMaxAge: number
}

export class CreateSessionDto implements CreateSessionRequest {
    @ValidateNested()
    @Type(() => Session)
    session: Session;
}
