import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { FindAllRolesDto } from './dto/findAll-role.dto';
import { FindOneRoleDto } from './dto/findOne-role.dto';
import { DeleteRoleDto } from './dto/delete-role.dto';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';
import { RpcAlreadyExistsException, RpcNotFoundException } from '@ms/common/rpcExceprions';
import { AssignRoleToUserDto } from './dto/assign-role.dto';
import { UnAssignRoleToUserDto } from './dto/unassign-role.dto';
import { UserRole } from '../users/entities/userRole.entity';
import { Long } from '@grpc/proto-loader';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private readonly rolesRepository: Repository<Role>,
    @InjectRepository(UserRole) private readonly userRolesRepository: Repository<UserRole>,
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
    const [roles, count] = await this.rolesRepository.findAndCount({
      take: limit,
      skip,
      relations:["rolePermissions", "rolePermissions.permission"],
      order:{ 
        id: "DESC"
      }
    })

    return {page, limit, count, roles };
  }

  async findOne({ id }: FindOneRoleDto) {
    const role = await this.rolesRepository.findOne({
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
    const role = await this.userRolesRepository.findOneBy({roleId, userId})
    if (!role) {
      throw new RpcNotFoundException(`role with id '${roleId}' does not exist`)
    }

    const newAssignedUserRole = {
      roleId,
      userId,
    }
    await this.userRolesRepository.save(newAssignedUserRole)
    
    return {};
  }

  async unassignRole({roleId, userId}: UnAssignRoleToUserDto) {
    const userRole = await this.userRolesRepository.findOneBy({roleId, userId})
    if (!userRole) {
      throw new RpcNotFoundException(`assignment with role id '${roleId}' and user id '${userId}' does not exist`)
    }

    await this.userRolesRepository.remove(userRole)
    
    return {};
  }
}