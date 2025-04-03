import { Role } from "@src/modules/roles/entities/role.entity";
import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @CreateDateColumn()
  createdAt: Date

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}