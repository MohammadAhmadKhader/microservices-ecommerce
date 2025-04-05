import { Permission } from '@src/modules/permissions/entities/permission.entity';
import { User } from '@src/modules/users/entities/user.entity';
import { UserRole } from '@src/modules/users/entities/userRole.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { RolePermission } from './rolePermission.entity';

@Entity()
export class Role {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ unique: true })
    name: string;

    @OneToMany(() => RolePermission, (perm)=> perm.role)
    rolePermissions: RolePermission[]

    @OneToMany(() => UserRole, (userRole) => userRole.role)
    userRoles: UserRole[]

    toProto() {
        console.log(this.rolePermissions,"role permissions")
        return {
            id: this.id,
            name: this.name,
            permissions: this.rolePermissions.map((rolePermissions) => {
                return rolePermissions.permission
            })
        }
    }

    static toProtoArray(roles: Role[]) {
        return roles.map((role) => role.toProto())
    }
}