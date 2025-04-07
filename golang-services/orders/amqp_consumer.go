package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"ms/common"
	"ms/common/broker"
	pb "ms/common/generated"
	"ms/orders/models"

	amqp "github.com/rabbitmq/amqp091-go"
)

var (
	RabbitMQ_User     = common.EnvString("RABBITMQ_USER", "")
	RabbitMQ_Password = common.EnvString("RABBITMQ_PASSWORD", "")
	RabbitMQ_Host     = common.EnvString("RABBITMQ_HOST", "")
	RabbitMQ_Port     = common.EnvString("RABBITMQ_Port", "")
)

type Consumer struct {
	service OrdersService
}

func NewConsumer(service OrdersService) *Consumer {
	return &Consumer{
		service,
	}
}

func (c *Consumer) Consume(channel *amqp.Channel) {
	queue, err := channel.QueueDeclare(string(broker.OrdersQueue), false, true, false, false, nil)
	if err != nil {
		log.Fatal(err)
	}

	err = channel.QueueBind(queue.Name, string(broker.RK_ProductStockReservedFailed), string(broker.OrdersExchange), false, nil)
	if err != nil {
		log.Fatal(err)
	}

	messages, err := channel.Consume(queue.Name, "", false, false, false, false, nil)
	if err != nil {
		log.Fatal(err)
	}

	var listener chan any

	go func() {
		for delivery := range messages {
			log.Println("received message: ", string(delivery.Body))

			switch (delivery.RoutingKey) {
			case string(broker.RK_ProductStockReservedFailed):
				var messageBody = ProductsStockFailed{}
				err := json.Unmarshal(delivery.Body, &messageBody)
				if err != nil {
					log.Println(err)
					delivery.Nack(false, false)
					continue
				}

				status := models.Status(messageBody.Status)
				_, err = c.service.UpdateOrderStatus(context.Background(), &pb.UpdateOrderStatusRequest{
					Id:     int32(messageBody.OrderId),
					Status: pb.Status((&status).GetEnumNum()),
				})
				if err != nil {
					log.Println(err)
					delivery.Nack(false, false)
					continue
				}
				delivery.Ack(true)
			}
		}
	}()

	fmt.Println("Consuming orders queue")
	<-listener
}
