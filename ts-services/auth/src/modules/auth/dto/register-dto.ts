import { RegistRequest } from "@ms/common/generated/auth"
import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator"
import { PickType } from "@nestjs/mapped-types"
import { LoginDto } from "./login-dto"

export class RegisterDto extends PickType(LoginDto, ["email", "password"] as const) implements RegistRequest {
    @IsString({message:"firstName must be a string"})
    @IsNotEmpty({message:"firstName is required"})
    @MinLength(3, {message:"firstName must be at least 3 characters"})
    @MaxLength(32, {message:"firstName must be at most 32 characters"})
    firstName: string
    
    @IsString({message:"lastName must be a string"})
    @IsNotEmpty({message:"lastName is required"})
    @MinLength(3, {message:"lastName must be at least 3 characters"})
    @MaxLength(32, {message:"lastName must be at most 32 characters"})
    lastName: string
}