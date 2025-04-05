import { Entity, JoinColumn, ManyToOne, PrimaryColumn, Unique } from "typeorm";
import { User } from "./user.entity";
import { Role } from "@src/modules/roles/entities/role.entity";

@Entity({
    name:"user_roles",
})
@Unique(["userId", "roleId"]) 
export class UserRole {
    @PrimaryColumn({ name: "userId"})
    userId: number;
  
    @PrimaryColumn({ name: "roleId"})
    roleId: number;

    @ManyToOne(() => Role, (user) => user.userRoles, { onDelete: "CASCADE" })
    @JoinColumn({ name: "roleId"})
    role: Role

    @ManyToOne(() => User, (role) => role.userRoles, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId"})
    user: User
}