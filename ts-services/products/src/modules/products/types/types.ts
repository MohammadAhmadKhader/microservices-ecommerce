import { ProductProtobuf } from "../entities/product.entity"

export interface FindAllProducts {
    page: number
    limit: number
    count: number
    products: ProductProtobuf[]
}

export interface OrderCompletedMessage {
    id:number,
    userId:number,
    totalPrice:number,
    status:"Completed",
    orderItems:{
        quantity:number,
        productId:number,
    }[]
}

export type UpdateStocksParams = OrderCompletedMessage["orderItems"]