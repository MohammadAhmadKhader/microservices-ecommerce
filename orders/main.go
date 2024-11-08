package main

import (
	"log"
	"ms/common/common-go"
	"ms/common/common-go/broker"
	"net"

	_ "github.com/joho/godotenv/autoload"

	"google.golang.org/grpc"
)

var (
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
	defer func(){
		close()
		amqpChan.Close()
	}()

	store := NewStore(DB)
	service := NewService(store)

	consumer := NewConsumer(service)
	go consumer.Consume(amqpChan)

	NewGrpcHandler(grpcServer, service, amqpChan)

	log.Println("listening on port: ", grpcAddr)
	if err := grpcServer.Serve(listener); err != nil {
		log.Fatal(err)
	}
}
