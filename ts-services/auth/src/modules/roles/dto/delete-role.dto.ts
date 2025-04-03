import { IsNotEmpty, IsNumber } from 'class-validator';

export class DeleteRoleDto {
  @IsNotEmpty({message:"id is required"})
  @IsNumber({}, {message:"id must be a number"})
  id: number;
}