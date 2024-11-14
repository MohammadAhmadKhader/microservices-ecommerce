import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class BrokerService implements OnModuleDestroy {
    private connection: amqp.Connection
    private channel: amqp.Channel

    async initialize(){
        this.connection = await amqp.connect(`amqp://${process.env.RABBIT_USER}:${process.env.RABBIT_PASSWORD}@${process.env.RABBIT_HOST}:${process.env.RABBIT_PORT}`)
        this.channel = await this.connection.createChannel()
    }

    async addConsumer(consumer: (channel: amqp.Channel,connection?: amqp.Connection) => Promise<void>){
        await consumer(this.channel, this.connection)
    }

    async onModuleDestroy() {
        await this.connection.close()  
    }
}