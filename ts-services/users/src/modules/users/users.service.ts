import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import {toProtobufTimestamp} from "@ms/common"
import { FindAllUsersResponse, UpdateUserRequest } from '@ms/common/generated/users';
import {RpcAlreadyExistsException, RpcNotFoundException} from "@ms/common/rpcExceprions"
import { TraceMethod } from '@ms/common/observability/telemetry';
import { DeleteUserDto } from './dto/delete-user.dto';
import { FindAllDto } from './dto/findAll-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private usersRepository: Repository<User>){}

  @TraceMethod()
  async create(createDto: CreateUserDto) {
    const lowerCaseEmail = createDto.email.toLowerCase()
    const IsUserExist = await this.usersRepository.exists({where:{email: lowerCaseEmail}})
    if (IsUserExist) {
      throw new RpcAlreadyExistsException("User with this email already exist")
    }

    const createdUser = this.usersRepository.create({...createDto, email: lowerCaseEmail})
    const operationType: UserOperations = "USER_CREATION"
    const user = await this.usersRepository.save(createdUser, {
      data:{
        operationType
      }
    })

    if (user) {
      user.createdAt = toProtobufTimestamp(user.createdAt)
      user.updatedAt = toProtobufTimestamp(user.updatedAt)
    }

    return { user };
  }

  @TraceMethod()
  async findAll({page, limit}: FindAllDto) : Promise<FindAllUsersResponse> {
    const count = await this.usersRepository.count()
    const skip = (page - 1) * limit;

    let users = await this.usersRepository.find({
      skip,
      take: limit,
      select: ["id", "firstName","lastName", "email", "createdAt", "updatedAt"]
    })

    users = users.map((user)=>{
      user.createdAt = toProtobufTimestamp(user.createdAt)
      user.updatedAt = toProtobufTimestamp(user.updatedAt)
      return user
    })
    return {page, limit, count, users}
  }

  @TraceMethod()
  async findOneById({id}) {
    const user = await this.usersRepository.findOneBy({id})
    if (user) {
      user.createdAt = toProtobufTimestamp(user.createdAt)
      user.updatedAt = toProtobufTimestamp(user.updatedAt)
    }
    
    return { user }
  }

  @TraceMethod()
  async findOneByEmail({email}) {
    const user = await this.usersRepository.findOneBy({email});
    if (user) {
      user.createdAt = toProtobufTimestamp(user.createdAt)
      user.updatedAt = toProtobufTimestamp(user.updatedAt)
    }
    return { user }
  }

  @TraceMethod()
  async update(req: UpdateUserRequest) {
    const {id, ...updateDto} = req
    const user = await this.usersRepository.findOneBy({id})
    if (!user) {
      throw new RpcNotFoundException(`product with id ${id} was not found`)
    }
    
    Object.assign(user, updateDto)
    const createdUser = await this.usersRepository.save(user)
    return { user: createdUser }
  }

  @TraceMethod()
  async remove({id}: DeleteUserDto) {
    await this.usersRepository.delete(id)
  }
}
