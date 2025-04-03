import { Role } from "@src/modules/roles/entities/role.entity";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
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

  @ManyToMany(() => Role, (role) => role.users, {cascade: true})
  @JoinTable()
  roles: Role[]
}
