import { DeleteUserRequest, FindAllUsersRequest } from "@ms/common/generated/users"
import { IsNotEmpty, IsNumber, Min } from "class-validator";

export class FindAllDto implements FindAllUsersRequest {
  @Min(1, {message:"page must be at least 1"})
  @IsNotEmpty({message:"page is required"})
  @IsNumber({}, {message:"page must be a number"})
  page: number;

  
  @IsNotEmpty({message:"limit is required"})
  @IsNumber({}, {message:"limit must be a number"})
  @Min(5, {message:"limit must be at least 5"})
  limit: number;
}