import { IsNotEmpty, IsNumber } from "class-validator";

export class FindOneRoleDto {
    @IsNotEmpty({message:"id is required"})
    @IsNumber({}, {message:"id must be a number"})
    id: number;
}