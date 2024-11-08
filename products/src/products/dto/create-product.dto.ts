import {IsNotEmpty, IsNumber, IsString} from "class-validator"

export class CreateProductDto {
    @IsString({message:"name must be a string"})
    @IsNotEmpty({message:"name is required"})
    name:string

    @IsString({message:"description must be a string"})
    @IsNotEmpty({message:"description is required"})
    description:string

    @IsNumber({}, {message:"price must be a number"})
    @IsNotEmpty({message:"price is required"})
    price: number

    @IsNumber({}, {message:"quantity must be a number"})
    @IsNotEmpty({message:"quantity is required"})
    quantity: number

    @IsNumber({}, {message:"category id must be a number"})
    @IsNotEmpty({message:"category id is required"})
    categoryId: number
}
