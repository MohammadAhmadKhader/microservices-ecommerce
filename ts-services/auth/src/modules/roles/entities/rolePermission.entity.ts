import { Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, Unique } from "typeorm"
import { Role } from "./role.entity"
import { Permission } from "@src/modules/permissions/entities/permission.entity"


@Entity({
    name:"role_permissions"
})
@Unique(["roleId", "permissionId"])
export class RolePermission {
    @PrimaryColumn({ name:"roleId" })
    roleId: number

    @PrimaryColumn({ name: "permissionId"})
    permissionId: number

    @ManyToOne(() => Role, (role) => role.rolePermissions, { onDelete: "CASCADE"})
    @JoinColumn({ name:"roleId"})
    role:Role

    @ManyToOne(() => Permission, (perm) => perm.rolePermissions, { onDelete: "CASCADE"})
    @JoinColumn({ name:"permissionId"})
    permission: Permission
}