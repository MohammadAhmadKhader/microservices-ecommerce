import { IsNotEmpty, IsNumber, IsString } from "class-validator"

export class CreateRoleDto {
    @IsString({message:"name must be a string"})
    @IsNotEmpty({message:"name is required"})
    name:string
}
