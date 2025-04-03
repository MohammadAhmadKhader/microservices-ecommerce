import { IsNotEmpty, IsNumber, Min } from "class-validator";

export class FindOnePermissionById {
    @IsNotEmpty({message:"id is required"})
    @IsNumber({}, {message:"id must be a number"})
    @Min(1, {message:"id cant be negative or 0"})
    id: number
}