import { GetSessionRequest } from "@ms/common/generated/redis"
import { PickType } from "@nestjs/mapped-types"
import { IsNotEmpty, IsUUID } from "class-validator"

export class GetSessionDto implements GetSessionRequest {
    @IsNotEmpty({message:"sessionId is required"})
    @IsUUID("4",{message:"session id is invalid uuid"})
    sessionId: string
}

export class ValidateSessionDto extends PickType(GetSessionDto, ["sessionId"] as const) {}
export class DeleteSessionDto extends PickType(GetSessionDto, ["sessionId"] as const) {}