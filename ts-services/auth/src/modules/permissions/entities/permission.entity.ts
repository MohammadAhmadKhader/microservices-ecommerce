import { Role } from "@src/modules/roles/entities/role.entity";
import { RolePermission } from "@src/modules/roles/entities/rolePermission.entity";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @ManyToMany(() => Role, (role) => role.rolePermissions)
  rolePermissions: RolePermission[];
}