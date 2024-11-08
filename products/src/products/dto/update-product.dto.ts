import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsNotEmpty({message:"id is required"})
  @IsNumber({}, {message:"id must be a number"})
  id: number;
  
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: 'quantity must be a number' })
  quantity?: number;

  @IsOptional()
  @IsNumber({}, { message: 'price must be a number' })
  price?: number;

  @IsOptional()
  @IsNumber({}, { message: 'category id must be a number' })
  categoryId?: number;
}
