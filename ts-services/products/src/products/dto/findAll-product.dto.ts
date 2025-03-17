import { FindAllProductsRequest } from "@ms/common/generated/products";
import { IsNotEmpty, IsNumber, Max, Min, } from "class-validator";

export class FindAllProductsDto implements FindAllProductsRequest {
  @IsNotEmpty({message:"page is required"})
  @IsNumber({}, {message:"page must be a number"})
  page: number;

  @IsNotEmpty({message:"limit is required"})
  @IsNumber({}, {message:"limit must be a number"})
  limit: number;
}