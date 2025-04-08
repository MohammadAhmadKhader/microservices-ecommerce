package main

import (
	"context"
	"log"
	"ms/carts/cli"
	"ms/carts/gateway"
	"ms/carts/shared"
	"ms/common"
	"ms/common/broker"
	"ms/common/discovery"
	"net"
	"os"
	"slices"

	_ "github.com/joho/godotenv/autoload"
	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
	"go.opentelemetry.io/otel/attribute"
	semconv "go.opentelemetry.io/otel/semconv/v1.4.0"
	"go.opentelemetry.io/otel/trace"

	"github.com/grpc-ecosystem/go-grpc-prometheus"
	"google.golang.org/grpc"
)

var (
	serviceName      = shared.ServiceName  
	serviceHost      = shared.ServiceHost
	metricsPort      = shared.MetricsPort
	serviceAddr  	 = shared.ServiceAddr
	ConsulAddr       = shared.ConsulAddr
	
	tracer trace.Tracer = shared.Tracer
)

func main() {
	if slices.Contains(os.Args, "seed") {
		err := cli.ExecuteCommands()
		log.Println(err)
		return
	}

	ctx := context.Background()
	tracerProvider, err := shared.InitTracer(ctx, common.TracingOptions{
		ResourceAttributes: []attribute.KeyValue{
			semconv.DBSystemPostgreSQL,
		},
	})
	if err != nil {
		log.Fatal(err)
	}
	defer tracerProvider.Shutdown(ctx)

	grpcServer := grpc.NewServer(
		grpc.ChainUnaryInterceptor(
			grpc_prometheus.UnaryServerInterceptor,
			common.GrpcMetricsInterceptor(serviceName),
		),
		grpc.StreamInterceptor(grpc_prometheus.StreamServerInterceptor),
		grpc.StatsHandler(otelgrpc.NewServerHandler()),
	)
	common.GrpcInitMetrics(grpcServer)
	common.CreateHttpMetricsAndInit(serviceHost, metricsPort)

	listener, err := net.Listen("tcp", serviceAddr)
	if err != nil {
		log.Fatal(err)
	}
	defer listener.Close()

	amqpChan, close := broker.Connect(RabbitMQ_User, RabbitMQ_Password, RabbitMQ_Host, RabbitMQ_Port)
	defer func() {
		close()
		amqpChan.Close()
	}()

	registry, instanceId, err := discovery.InitRegistryAndHandleIt(ctx, serviceName, serviceAddr, ConsulAddr)
	if err != nil {
		log.Fatal(err)
	}

	defer registry.Deregister(ctx, instanceId)

	gateway := gateway.NewGateway(registry)

	logger := shared.InitLogger()

	DB := InitDB(logger)
	store := NewStore(DB)
	service := NewService(store, gateway)
	serviceWithOtel := NewTelemetryMiddleware(service)
	serviceWithLogging := NewLoggingMiddleware(serviceWithOtel, logger)

	consumer := NewConsumer(serviceWithLogging)
	go consumer.Consume(amqpChan)

	NewGrpcHandler(grpcServer, serviceWithLogging, amqpChan)

	log.Println("listening on address: ", serviceAddr)
	if err := grpcServer.Serve(listener); err != nil {
		log.Fatal(err)
	}
}
