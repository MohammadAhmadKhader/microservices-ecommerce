import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsNotEmpty, IsNumber, ValidateIf } from 'class-validator';
import { UpdateProductRequest } from '@ms/common/generated/products';

export class UpdateProductDto extends PartialType(CreateProductDto, {
  skipNullProperties: false
}) implements Partial<UpdateProductRequest> {
  @IsNotEmpty({message:"id is required"})
  @IsNumber({}, {message:"id must be a number"})
  id: number;

  @ValidateIf((o) => !Object.keys(o).some((key) => key !== 'id'))
  @IsNotEmpty({ message: 'at least one field must be updated' })
  dummyField?: string;
}