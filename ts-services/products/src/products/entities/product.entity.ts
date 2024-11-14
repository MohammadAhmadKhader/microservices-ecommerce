import { Timestamp } from 'google-protobuf/google/protobuf/timestamp_pb';
import { toProtobufTimestamp } from '@ms/common/utils';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    description: string

    @Column()
    quantity: number

    @Column()
    price: number

    @Column()
    categoryId: number

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    ConvertToProtobufType=() =>{
        return new ProductProtobuf(this)
    }
}

export class ProductProtobuf {
    id: number
    name: string
    description: string
    price: number
    quantity: number
    categoryId: number
    createdAt: Timestamp
    updatedAt: Timestamp

    constructor(product :Product) {
        this.id = product.id
        this.name = product.name
        this.description = product.description
        this.price = product.price
        this.quantity = product.quantity
        this.categoryId = product.categoryId
        this.createdAt = toProtobufTimestamp(product.createdAt)
        this.updatedAt = toProtobufTimestamp(product.updatedAt)
    }
}