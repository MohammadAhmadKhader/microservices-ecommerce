import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import {toProtobufTimestamp} from "@ms/common/utils"
import { CreateUserRequest, FindAllUsersResponse, UpdateUserRequest } from '@ms/common/generated/users';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private usersRepository: Repository<User>){}

  async create(createDto: CreateUserRequest) {
    const lowerCaseEmail = createDto.email.toLowerCase()
    const IsUserExist = await this.usersRepository.exists({where:{email: lowerCaseEmail}})
    if (IsUserExist) {
      throw new BadRequestException("user with this email already exist")
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

  async findAll(page : number, limit : number) : Promise<FindAllUsersResponse> {
    const count = await this.usersRepository.count()
    let users = await this.usersRepository.find()
    users = users.map((user)=>{
      user.createdAt = toProtobufTimestamp(user.createdAt)
      user.updatedAt = toProtobufTimestamp(user.updatedAt)
      return user
    })
    return {page, limit, count, users}
  }

  async findOneById(id: number) {
    const user = await this.usersRepository.findOneBy({id})
    if (user) {
      user.createdAt = toProtobufTimestamp(user.createdAt)
      user.updatedAt = toProtobufTimestamp(user.updatedAt)
    }
    
    return { user }
  }

  async findOneByEmail(email: string) {
    const user = await this.usersRepository.findOneBy({email});
    if (user) {
      user.createdAt = toProtobufTimestamp(user.createdAt)
      user.updatedAt = toProtobufTimestamp(user.updatedAt)
    }
    return { user }
  }

  async update(req: UpdateUserRequest) {
    const {id, ...updateDto} = req
    const user = await this.usersRepository.findOneBy({id})
    if (!user) {
      throw new NotFoundException(`product with id ${id} was not found`)
    }
    
    Object.assign(user, updateDto)
    const createdUser = await this.usersRepository.save(user)
    return { user: createdUser }
  }

  async remove(id: number) {
    await this.usersRepository.delete(id)
  }
}
