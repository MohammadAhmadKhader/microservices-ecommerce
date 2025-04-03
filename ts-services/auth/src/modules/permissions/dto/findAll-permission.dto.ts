import { IsNotEmpty, IsNumber } from "class-validator";

export class FindAllPermissionsDto {
    @IsNotEmpty({message:"page is required"})
    @IsNumber({}, {message:"page must be a number"})
    page: number;

    @IsNotEmpty({message:"limit is required"})
    @IsNumber({}, {message:"limit must be a number"})
    limit: number;
}