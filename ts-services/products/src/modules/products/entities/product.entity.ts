
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

    @Column('decimal', { precision: 10, scale: 2 })
    price: number

    @Column()
    categoryId: number

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    ToProto() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            price: this.price,
            quantity: this.quantity,
            categoryId: this.categoryId,
            createdAt: toProtobufTimestamp(this.createdAt),
            updatedAt: toProtobufTimestamp(this.updatedAt)
        }
    }

    static ToProtoArray(products: Product[]) {
        return products.map((prod) => prod.ToProto())
    }
}