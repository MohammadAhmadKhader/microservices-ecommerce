import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @Min(1, {message:"id must be at least 1"})
  @IsNotEmpty({message:"id is required"})
  @IsNumber({}, {message:"id must be a number"})
  id: number;
}
