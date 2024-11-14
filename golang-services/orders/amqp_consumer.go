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
	queue, err := channel.QueueDeclare("", false, true, false, false, nil)
	if err != nil {
		log.Fatal(err)
	}

	err = channel.QueueBind(queue.Name, "", broker.OrderStatusUpdated, false, nil)
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
			log.Println("Received message: ", string(delivery.Body))

			var order = models.Order{}
			err := json.Unmarshal(delivery.Body, &order)
			if err != nil {
				log.Println(err)
				delivery.Nack(false, false)
				continue
			}

			status, isValidStatus := pb.Status_value[string(order.Status)]
			if !isValidStatus {
				log.Fatal(fmt.Errorf("invalid order status received: %v", order.Status))
				delivery.Nack(false, false)
				continue
			}

			updatedOrder, err := c.service.UpdateOrderStatus(context.Background(), &pb.UpdateOrderStatusRequest{
				Id:     int32(order.ID),
				Status: pb.Status(status),
			})
			if err != nil {
				log.Fatal(err)
				delivery.Nack(false, false)
				continue
			}

			if updatedOrder.Status == pb.Status_Completed {
				fmt.Println("Completed Order Send Email")
			} else {
				fmt.Println("Order Status is: ", updatedOrder.Status)
			}

			delivery.Ack(true)
		}
	}()

	fmt.Println("Consuming")
	<-listener
}
