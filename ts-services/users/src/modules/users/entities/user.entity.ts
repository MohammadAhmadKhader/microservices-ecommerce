import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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
}
