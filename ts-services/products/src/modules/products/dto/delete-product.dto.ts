import { DeleteOneProductRequest } from '@ms/common/generated/products';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class DeleteProductDto implements DeleteOneProductRequest {
  @IsNotEmpty({message:"id is required"})
  @IsNumber({}, {message:"id must be a number"})
  id: number;
}