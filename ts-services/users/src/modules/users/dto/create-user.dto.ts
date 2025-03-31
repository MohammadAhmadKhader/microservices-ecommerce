import { CreateUserRequest } from "@ms/common/generated/users"
import { PickType } from "@nestjs/mapped-types"
import {IsEmail, IsNotEmpty, IsString,MaxLength, MinLength} from "class-validator"

export class CreateUserDto implements CreateUserRequest {
    @IsString({message:"firstName must be a string"})
    @IsNotEmpty({message:"firstName is required"})
    @MinLength(3, {message:"firstName must be at least 6 characters"})
    @MaxLength(32, {message:"firstName must be at most 32 characters"})
    firstName: string
    
    @IsString({message:"lastName must be a string"})
    @IsNotEmpty({message:"lastName is required"})
    @MinLength(3, {message:"lastName must be at least 6 characters"})
    @MaxLength(32, {message:"lastName must be at most 32 characters"})
    lastName: string
    
    @IsString({message:"email must be a string"})
    @IsEmail()
    email: string

    @IsString({message:"password must be a string"})
    @IsNotEmpty({message:"password is required"})
    @MaxLength(64, {message:"password can not exceed 64 characters"})
    password: string
}

export class FindOneByEmailDto extends PickType(CreateUserDto, ["email"] as const) {}