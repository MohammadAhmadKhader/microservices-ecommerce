import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import {RpcAlreadyExistsException, RpcNotFoundException} from "@ms/common/rpcExceprions"
import { DeleteUserDto } from './dto/delete-user.dto';
import { FindAllDto } from './dto/findAll-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './entities/userRole.entity';
import { Role } from '../roles/entities/role.entity';

@Injectable()
export class UsersService {
  private defaultRoleId: number | undefined
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectDataSource() private readonly dataSource: DataSource
  ){}

  async create(createDto: CreateUserDto) {
    const lowerCaseEmail = createDto.email.toLowerCase()
    const IsUserExist = await this.usersRepository.exists({where:{email: lowerCaseEmail}})
    if (IsUserExist) {
      throw new RpcAlreadyExistsException("User with this email already exist")
    }

    let returnedUser: User
    await this.dataSource.transaction(async (manager) => {
      const managerUsersRepository = manager.getRepository(User)
      const managerUserRolesRepository = manager.getRepository(UserRole)
      const rolesRepository = manager.getRepository(Role)

      if(!this.defaultRoleId) {
        const defaultUserRole = await rolesRepository.findOne({
          where:{
            name:"User"
          }
        })

        this.defaultRoleId = defaultUserRole.id
      }

      const createdUser = managerUsersRepository.create({...createDto, email: lowerCaseEmail})
      const operationType: UserOperations = "USER_CREATION"
      const user = await managerUsersRepository.save(createdUser, {
        data:{
          operationType
        },
      })

      await managerUserRolesRepository.save({
        roleId: this.defaultRoleId,
        userId: user.id
      })

      returnedUser = await managerUsersRepository.findOne({
          where: {id: user.id},
          relations:{
            userRoles:{
              role: {
                rolePermissions: {
                  permission: true
                }
              }
            }
          }
      })

      if(!returnedUser) {
        throw new Error("an error has occured during transaction")
      }
    })

    return { user: returnedUser };
  }

  async findAll({page, limit}: FindAllDto) {
    const skip = (page - 1) * limit;
    const [users, count] = await this.usersRepository.findAndCount({
      skip,
      take: limit,
      select: ["id", "firstName","lastName", "email", "createdAt", "updatedAt"], 
      order: {
        createdAt: 'DESC'
      }
    })

    return {page, limit, count, users}
  }

  async findOneById({id}) {
    const user = await this.usersRepository.findOne({
      where:{
        id
      }
    })
    
    return { user }
  }

  async findOneByEmail({email}) {
    const user = await this.usersRepository.findOne(
      {
        where: {
          email
        }
      }
    );

    return { user }
  }

  async findOneByEmailWithDetails({email}:{email: string}) {
    const user = await this.usersRepository.findOne(
      {
        where: {
          email
        },
        relations:[
          "userRoles", 
          "userRoles.role",
          "userRoles.role.rolePermissions" ,
          "userRoles.role.rolePermissions.permission"]
        }
    );

    return { user }
  }

  async findOneByIdWithDetails({id}:{id: number}) {
    const user = await this.usersRepository.findOne(
      {
        where: {
          id
        },
        relations:[
          "userRoles", 
          "userRoles.role",
          "userRoles.role.rolePermissions" ,
          "userRoles.role.rolePermissions.permission"]
        }
    );

    return { user }
  }

  async update(req: UpdateUserDto) {
    const {id, ...updateDto} = req
    const user = await this.usersRepository.findOneBy({id})
    if (!user) {
      throw new RpcNotFoundException(`product with id ${id} was not found`)
    }
    
    Object.assign(user, updateDto)
    const createdUser = await this.usersRepository.save(user)
    return { user: createdUser }
  }

  async remove({id}: DeleteUserDto) {
    const user = await this.usersRepository.findOneBy({id})
    if(!user) {
      throw new RpcNotFoundException(`user with id '${id}' was not found`)
    }

    await this.usersRepository.delete(id)

    return {}
  }

  async changeUserPassword({user, newPassword}: {user: User, newPassword: string}) {
    user.password = newPassword
    return await this.usersRepository.save(user)
  }

  async save(user: User) {
    return await this.usersRepository.save(user)
  }
}