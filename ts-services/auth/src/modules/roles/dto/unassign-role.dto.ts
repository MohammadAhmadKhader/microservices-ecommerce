import { IsNotEmpty, IsNumber } from "class-validator";

export class UnAssignRoleToUserDto {
    @IsNotEmpty({message:"roleId is required"})
    @IsNumber({}, {message:"roleId must be a number"})
    roleId: number

    @IsNotEmpty({message:"userId is required"})
    @IsNumber({}, {message:"userId must be a number"})
    userId: number
}