import * as amqp from "amqplib"
import { queues, routingKeys, exchanges } from "@ms/common/modules/broker/brokerConfig"
import { OrderCompletedMessage } from "./types/types"
import { ProductsService } from "./products.service"

// TODO: Refactor this to be re-usable
export function createConsumer(productsService: ProductsService) {
    return async (channel: amqp.Channel)=>{
        
        await channel.consume(queues.products_queue.queue, async (message)=>{
            if (!message) {
                channel.nack(message, false, false)
                return
            }
            const msgJSON = JSON.parse(message.content.toString()) as OrderCompletedMessage

            let isError = false;
            await productsService.updateStock(msgJSON.orderItems).then(()=>{
                console.log("products stock was updated successfully")
                channel.ack(message)
            }).catch((err)=>{
                console.log(`an error has occurred during updated products stock: `, err)
                isError = true
            })
            
            if(isError) {
                channel.nack(message, false, false)
            }
            return
            
            //if(!isError) {
                //// for notification service lately
                //channel.publish("exchange", routingKeys.product_reserved_success, Buffer.from(""),{
                //    contentType:"application/json",
                //    deliveryMode: 2 // persistent,
                //})
            //}
        })
    }
}

export function createDLQConsumer(productsService: ProductsService){
    return async (channel: amqp.Channel) => {
        await channel.consume(queues.products_dlq.queue, async (message)=>{
            try {
                console.log("dead products letter queue, received message content: ", message.content.toString())
                const maxRetry = 3
                const deathCount = message.properties.headers["x-death"][0].count

                if (deathCount && deathCount <= maxRetry) {
                    console.log("message was re-published")

                    channel.nack(message, false, false)
                } else {
                    console.log(`max tries have been achieved '${maxRetry}'`)
                    
                    channel.publish(
                        exchanges.orders_exchange.exchange, 
                        routingKeys.product_stockReserved_fail, 
                        message.content,{
                        persistent: true
                    })
                    channel.ack(message)
                }

                //channel.ack(message)
            } catch (error) {
                console.error(error)
                channel.nack(message, false, false)
            }
        })
    }
}
