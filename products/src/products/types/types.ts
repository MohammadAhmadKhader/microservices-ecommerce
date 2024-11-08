import { ProductProtobuf } from "../entities/product.entity"

export interface FindAllProducts {
    page: number
    limit: number
    count: number
    products: ProductProtobuf[]
}