import * as amqp from "amqplib"
import { queues } from "@ms/common/modules/broker/brokerConfig"

export async function consumer(channel: amqp.Channel) {
    const routingKey = "order.status.update"

    const queue = await channel.assertQueue(
        queues.orders_queue.queue, 
        queues.orders_queue.options)

    await channel.bindQueue(queue.queue, routingKey, "")

    await channel.consume(queue.queue, (message)=>{
        console.log("content: ", message.content.toString())

        channel.ack(message)
    })
}
