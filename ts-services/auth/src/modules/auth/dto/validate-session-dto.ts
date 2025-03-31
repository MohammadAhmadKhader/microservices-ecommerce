import { ValidateSessionRequest } from "@ms/common/generated/auth";
import { IsNotEmpty, IsUUID } from "class-validator";

export class ValidateSessionDto implements ValidateSessionRequest {
    @IsNotEmpty({message:"sessionId is required"})
    @IsUUID("4",{message:"session id is invalid uuid"})
    sessionId: string;
}