import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserRole } from "./userRole.entity";
import { toProtobufTimestamp } from "@ms/common/utils";
import { Role } from "@ms/common/generated/roles";
import { Permission } from "@ms/common/generated/permissions";
import { RolePermission } from "@src/modules/roles/entities/rolePermission.entity";

@Entity()
@Index(["email"], { unique: true })
export class User {
  @PrimaryGeneratedColumn({name:"id"})  
  id: number;

  @Column({name:"firstName"})
  firstName: string;

  @Column({name:"lastName"})
  lastName: string;

  @Column({name:"email"})
  email: string;

  @Column({name:"password"})
  password: string;

  @Column({ nullable:true,name:"mobileNumber" })
  mobileNumber: string;

  @CreateDateColumn({name:"createdAt"})
  createdAt: Date | undefined

  @UpdateDateColumn({name:"updatedAt"})
  updatedAt: Date | undefined

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles: UserRole[]

  @OneToMany(() => RolePermission, (rp) => rp.role)
  rolePermissions: RolePermission[];

  toProto() {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      mobileNumber: this.mobileNumber,
      createdAt: toProtobufTimestamp(this.createdAt),
      updatedAt: toProtobufTimestamp(this.updatedAt)
    }
  }  

  toProtoWithDetails() {
    const protoUser = this.toProto()
    const roles = this.userRoles.map((userRole) => {
      const permissions = userRole.role.rolePermissions.map((rolePermission) => {
        return { id: rolePermission.permission.id, name: rolePermission.permission.name } as Permission
      })

      return { id: userRole.role.id, name: userRole.role.name, permissions } as Role
    })

    return {...protoUser, roles }
  }
  
  static toProtoArray(users: User[]) {
    return users.map((u) => u.toProto())
  }

  static toProtoArrayWithDetails(users: User[]) {
    return users.map((user) => user.toProtoWithDetails())
  }
}
