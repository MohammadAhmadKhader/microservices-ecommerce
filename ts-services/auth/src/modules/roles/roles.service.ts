import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { FindAllRolesDto } from './dto/findAll-role.dto';
import { FindOneRoleDto } from './dto/findOne-role.dto';
import { DeleteRoleDto } from './dto/delete-role.dto';
import { Role } from './entities/role.entity';
import { FindOptionsRelations, Repository } from 'typeorm';
import { RpcAlreadyExistsException, RpcNotFoundException } from '@ms/common/rpcExceprions';
import { AssignRoleToUserDto } from './dto/assign-role.dto';
import { UnAssignRoleToUserDto } from './dto/unassign-role.dto';
import { handleObservable } from '@ms/common/utils';
import { getUsersGrpcService } from '@ms/common/grpc';
import { ConsulService } from '@ms/common';
import { UsersService } from '../users/users.service';
import { Permission } from '../permissions/entities/permission.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private readonly rolesRepository: Repository<Role>,
    @Inject(UsersService) private readonly usersService: UsersService
  ) {}

  async create({name}: CreateRoleDto) {
    const role = await this.rolesRepository.findOne({
      where: {
        name
      }
    })

    if(role) {
      throw new RpcAlreadyExistsException(`role with name ${name} already exists`)
    }

    const createdRole = await this.rolesRepository.save({name})

    return { role: createdRole };
  }

  async findAll({page, limit}: FindAllRolesDto) {
    const skip = (page - 1) * limit
    console.log(this.rolesRepository.target)
    const roles = await this.rolesRepository.find({
      take: limit,
      skip,
      relations:["permissions"]
    })

    return {roles};
  }

  async findOne({ id }: FindOneRoleDto) {
    const role = this.rolesRepository.findOne({
      where: {
        id
      }
    })

    if(!role) {
      throw new RpcNotFoundException(`role with id '${id} was not found`)
    }

    return { role };
  }

  async update({id, name}: UpdateRoleDto) {
    const role = await this.rolesRepository.findOneBy({id})
    if (!role) {
      throw new RpcNotFoundException(`role with id '${id}' does not exist`)
    }

    Object.assign(role, {name})
    console.log(role)
    const savedRole = await this.rolesRepository.save(role)

    return {role :savedRole};
  }

  async remove({id}: DeleteRoleDto) {
    const role = await this.rolesRepository.findOneBy({id})
    if (!role) {
      throw new RpcNotFoundException(`role with id '${id}' does not exist`)
    }

    await this.rolesRepository.delete(id)
    return {};
  }

  async assignRoleToUser({roleId, userId}: AssignRoleToUserDto) {
    const role = await this.rolesRepository.findOneBy({id: roleId})
    if (!role) {
      throw new RpcNotFoundException(`role with id '${roleId}' does not exist`)
    }

    const { user } = await this.usersService.findOneById({id: userId})
    console.log(user,"<---------------------- user")
    user.roles.push(role)
    await this.usersService.save(user)
    
    return {};
  }

  async unassignRole({roleId, userId}: UnAssignRoleToUserDto) {
    const role = await this.rolesRepository.findOneBy({id: roleId})
    if (!role) {
      throw new RpcNotFoundException(`role with id '${roleId}' does not exist`)
    }

   // const usersService = await this.getUsersService() 
   // const findUserRepo = await handleObservable(usersService.FindOneUserById({id: userId}))
//
   // await this.rolesRepository.create()
    
    return {};
  }

  
  //private async getUsersService(){
  //    const usersGrpcAddr = await this.registryService.discover("users")
  //    return getUsersGrpcService(usersGrpcAddr).getService()
  //}
  
}
