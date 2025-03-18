import { ResetPasswordRequest } from "@ms/common/generated/auth"
import { IsNotEmpty, IsNumber, IsString, MaxLength, Min } from "class-validator"

export class ResetPasswordDto implements ResetPasswordRequest {
    @Min(1, {message:"id must be at least 1"})
    @IsNotEmpty({message:"id is required"})
    @IsNumber({}, {message:"id must be a number"})
    id: number;
    
    @IsString({message:"password must be a string"})
    @IsNotEmpty({message:"password is required"})
    @MaxLength(64, {message:"password can not exceed 64 characters"})
    oldPassword: string
    
    @IsString({message:"password must be a string"})
    @IsNotEmpty({message:"password is required"})
    @MaxLength(64, {message:"password can not exceed 64 characters"})
    newPassword: string
    
    @IsString({message:"password must be a string"})
    @IsNotEmpty({message:"password is required"})
    @MaxLength(64, {message:"password can not exceed 64 characters"})
    confirmNewPassword: string
}