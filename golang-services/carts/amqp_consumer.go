package main

import (
	"context"
	"encoding/json"
	"log"
	"ms/common"
	"ms/common/broker"
	pb "ms/common/generated"
	"strconv"

	amqp "github.com/rabbitmq/amqp091-go"
	"google.golang.org/grpc/metadata"
)

var (
	RabbitMQ_User     = common.EnvString("RABBITMQ_USER", "")
	RabbitMQ_Password = common.EnvString("RABBITMQ_PASSWORD", "")
	RabbitMQ_Host     = common.EnvString("RABBITMQ_HOST", "")
	RabbitMQ_Port     = common.EnvString("RABBITMQ_Port", "")
)

type Consumer struct {
	service CartsService
}

func NewConsumer(service CartsService) *Consumer {
	return &Consumer{
		service,
	}
}

func (c *Consumer) Consume(channel *amqp.Channel) {
	queue, err := channel.QueueDeclare(string(broker.CartsQueue), false, true, false, false, nil)
	if err != nil {
		log.Fatal(err)
	}

	err = channel.QueueBind(queue.Name, string(broker.RK_OrderCreated), string(broker.OrdersExchange), false, nil)
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
			log.Println("routingKey", delivery.RoutingKey)

			switch (delivery.RoutingKey) {
			case string(broker.RK_OrderCreated):
				var messageBody = &pb.Order{}
				err := json.Unmarshal(delivery.Body, &messageBody)
				if err != nil {
					log.Println(err)
					delivery.Nack(false, false)
					continue
				}

				userId := messageBody.UserId
				if userId == 0 {
				    log.Println("invalid user id")
				    delivery.Nack(false, false)
				    continue
				}

				ctx := context.Background()
				md := metadata.New(map[string]string{
					"user-id": strconv.Itoa(int(userId)),
				})
				ctx = metadata.NewOutgoingContext(ctx, md)
				
				_, err = c.service.ClearCart(ctx, &pb.ClearCartRequest{})
				if err != nil {
					log.Println(err)
					delivery.Nack(false, false)
					continue
				}

				delivery.Ack(true)
			}
		}
	}()

	<-listener
}
