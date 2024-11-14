import { AssertExchangeParams, AssertQueueParams } from "../../types"

export const exchanges: Record<string, AssertExchangeParams> ={
    default:{ exchange: '', type: 'direct', options:{}},
    main_dlx:{ exchange: 'main_dlx', type: 'fanout', options:{}},
}
export const queues: Record<string, AssertQueueParams> = {
    orders_queue: { queue: 'orders_queue', options: { durable: true }},
    main_queue: {queue: "main_queue", options: { durable: true }},
    main_dlq : {queue:"main_dlq", options: { durable: true }}
}
export const routingKeys: Record<string, string> ={
    order_status_update:"order.status.update",
    order_created: "order.created"
}
