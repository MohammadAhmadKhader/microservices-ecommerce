import { Injectable } from '@nestjs/common';
import { FindAllPermissionsDto } from './dto/findAll-permission.dto';
import { FindOnePermissionById } from './dto/findOne-permission.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { Repository } from 'typeorm';
import { RpcNotFoundException } from '@ms/common/rpcExceprions';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission) private readonly permissionsRepository: Repository<Permission>
  ) {}

  async findAll({page, limit}: FindAllPermissionsDto) {
    const skip = (page - 1) * limit
    const permissions = await this.permissionsRepository.find({
      skip,
      take: limit 
    })

    return { permissions };
  }

  async findOne({ id }: FindOnePermissionById) {
    const permission = await this.permissionsRepository.findOne({
      where:{
        id
      }
    })

    if(!permission) {
      throw new RpcNotFoundException(`permission with id '${id}' was not found`)
    }

    return { permission };
  }
}
