import { Permission } from '@src/modules/permissions/entities/permission.entity';
import { User } from '@src/modules/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';

@Entity()
export class Role {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ unique: true })
    name: string;

    @ManyToMany(() => Permission, (perm)=> perm.roles, {cascade: true})
    @JoinTable()
    permissions: Permission[]

    @ManyToMany(() => User, (user)=> user.roles)
    users: User[]
}
