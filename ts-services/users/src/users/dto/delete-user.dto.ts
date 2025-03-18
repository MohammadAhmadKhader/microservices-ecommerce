import { DeleteUserRequest } from "@ms/common/generated/users"
import { PickType } from "@nestjs/mapped-types";
import { IsNotEmpty, IsNumber, Min } from "class-validator";

export class DeleteUserDto implements DeleteUserRequest {
    @Min(1, {message:"id must be at least 1"})
    @IsNotEmpty({message:"id is required"})
    @IsNumber({}, {message:"id must be a number"})
    id: number;
}

export class FindOneByIdDto extends PickType(DeleteUserDto, ["id"] as const) {}