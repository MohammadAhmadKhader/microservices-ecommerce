import { FindProductsByIdsRequest } from "@ms/common/generated/products";
import { ArrayMinSize, IsArray, IsInt } from "class-validator";

export class FindProductsByIds implements FindProductsByIdsRequest {
    @IsArray()                     
    @ArrayMinSize(1)         
    @IsInt({ each: true })   
    ids: number[];
}
