import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleDto } from './create-role.dto';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @IsNotEmpty({message:"id is required"})
  @IsNumber({}, {message:"id must be a number"})
  id: number;
}
