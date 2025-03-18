import { LoginRequest } from "@ms/common/generated/auth"
import { IsEmail, IsNotEmpty, IsString, MaxLength } from "class-validator"

export class LoginDto implements LoginRequest {
    @IsNotEmpty({message:"email is required"})
    @IsString({message:"email must be a string"})
    @IsEmail()
    email: string

    @IsString({message:"password must be a string"})
    @IsNotEmpty({message:"password is required"})
    @MaxLength(64, {message:"password can not exceed 64 characters"})
    password: string
}