package main

import (
	"context"
	"log"
	"ms/common"
	"ms/common/broker"
	"ms/common/discovery"
	"ms/orders/gateway"
	"net"

	_ "github.com/joho/godotenv/autoload"
	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
	"go.opentelemetry.io/otel/trace"

	"github.com/grpc-ecosystem/go-grpc-prometheus"
	"google.golang.org/grpc"
)

var (
	serviceName   = "orders"
	grpcAddr      = common.EnvString("GRPC_ADDR", "localhost:2000")
	TelemetryAddr = common.EnvString("TELEMETRY_ADDR", "localhost:4318")
)

var tracer trace.Tracer

func main() {
	ctx := context.Background()
	tracerProvider, err := common.InitTracer(ctx, TelemetryAddr, serviceName)
	if err != nil {
		log.Println(err)
	}
	defer tracerProvider.Shutdown(ctx)
	serviceTracer := tracerProvider.Tracer("orders-service")
	tracer = serviceTracer

	grpcServer := grpc.NewServer(
		grpc.UnaryInterceptor(grpc_prometheus.UnaryServerInterceptor),
		grpc.StreamInterceptor(grpc_prometheus.StreamServerInterceptor),
		grpc.StatsHandler(otelgrpc.NewServerHandler()),
	)
	common.GrpcInitMetrics(grpcServer)

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

	registry, instanceId, err := discovery.InitRegistryAndHandleIt(ctx, serviceName, grpcAddr)
	if err != nil {
		log.Fatal(err)
	}

	defer registry.Deregister(ctx, instanceId)

	gateway := gateway.NewGateway(registry)
	DB := InitDB()
	store := NewStore(DB)
	service := NewService(store, gateway)
	serviceWithOtel := NewTelemetryMiddleware(service)
	serviceWithLogging := NewLoggingMiddleware(serviceWithOtel)

	consumer := NewConsumer(serviceWithLogging)
	go consumer.Consume(amqpChan)

	NewGrpcHandler(grpcServer, serviceWithLogging, amqpChan)

	log.Println("listening on port: ", grpcAddr)
	if err := grpcServer.Serve(listener); err != nil {
		log.Fatal(err)
	}
}
