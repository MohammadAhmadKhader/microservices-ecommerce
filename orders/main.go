package main

import (
	"context"
	"log"
	"ms/common/common-go"
	"ms/common/common-go/broker"
	"ms/common/common-go/discovery"
	"ms/orders/gateway"
	"net"
	"time"

	_ "github.com/joho/godotenv/autoload"

	"google.golang.org/grpc"
)

var (
	serviceName = "orders"
	grpcAddr = common.EnvString("GRPC_ADDR", "localhost:2000")
)

func main() {
	grpcServer := grpc.NewServer()

	listener, err := net.Listen("tcp", grpcAddr)
	if err != nil {
		log.Fatal(err)
	}
	defer listener.Close()

	amqpChan, close := broker.Connect(RabbitMQ_User, RabbitMQ_Password, RabbitMQ_Host, RabbitMQ_Port)
	defer func() {
		close()
		amqpChan.Close()
	}()

	registry, err := discovery.NewRegistry("localhost:8500")
	if err != nil {
		log.Fatal(err)
	}

	ctx := context.Background()
	instanceId := discovery.GenInstanceId(serviceName)

	err = registry.Register(ctx, instanceId, grpcAddr, serviceName)
	if err != nil {
		log.Println(err)
	}

	go func() {
		for {
			err = registry.UpdateHealthCheck(instanceId, serviceName)
			if err != nil {
				log.Fatalf("error with updating health status: %v",err)
			}
			time.Sleep(time.Second * 5)
		}
	}()

	defer registry.Deregister(ctx, instanceId)

	gateway := gateway.NewGateway(registry)
	store := NewStore(DB)
	service := NewService(store, gateway)

	consumer := NewConsumer(service)
	go consumer.Consume(amqpChan)

	NewGrpcHandler(grpcServer, service, amqpChan)

	log.Println("listening on port: ", grpcAddr)
	if err := grpcServer.Serve(listener); err != nil {
		log.Fatal(err)
	}
}
