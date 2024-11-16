import { AssertExchangeParams, AssertQueueParams } from "../../types"

export const exchanges: Record<Exchanges, AssertExchangeParams> ={
    default:{ exchange: '', type: 'direct', options:{}},
    main_dlx:{ exchange: 'main_dlx', type: 'fanout', options:{}},
    products_exchange:{exchange: 'products_exchange', type: 'direct', options:{ durable:true }},
    products_dlx:{exchange: 'products_dlx', type: 'direct', options:{ durable:true }},
    orders_exchange:{exchange: 'orders_exchange', type: 'direct', options:{ durable:true }}
}

export const queues: Record<Queues, AssertQueueParams> = {
    orders_queue: { queue: 'orders_queue', options: { durable: true }},
    products_queue: { queue: 'products_queue', options: { durable: true }},
    products_dlq: { queue: 'products_dlq', options: { durable: true }},
    main_queue: {queue: "main_queue", options: { durable: true }},
    main_dlq : {queue:"main_dlq", options: { durable: true }},
}
// following [resource].[action].[success/failed]
// all will be made on this way, 
// unless if they were the first step of the transaction chain as its not needed to take other actions
export const routingKeys = {
    order_status_update:"order.status.update",
    order_created: "order.created",
    order_completed: "order.completed",
    product_stockReserved_success:"product.reserve_stock.success",
    product_stockReserved_fail:"product.reserve_stock.failed"
}

type Queues = "orders_queue" | "products_queue" | "main_queue" | "main_dlq" | "products_dlq"
type Exchanges = "default" | "main_dlx" | "products_exchange" | "orders_exchange" | "products_dlx"