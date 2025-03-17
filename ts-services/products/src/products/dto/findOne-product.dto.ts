import { FindOneProductRequest } from "@ms/common/generated/products";
import { IsNotEmpty, IsNumber } from "class-validator";

export class FindOneProductDto implements FindOneProductRequest {
  @IsNotEmpty({message:"id is required"})
  @IsNumber({}, {message:"id must be a number"})
  id: number;
}