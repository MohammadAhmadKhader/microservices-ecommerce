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
	serviceHost      = common.EnvString("SERVICE_HOST", "127.0.0.2")
	metricsPort      = common.EnvString("METRICS_PORT", "127.0.0.2")
	servicePort      = common.EnvString("SERVICE_PORT", "3001")
	serviceAddr  	 = serviceHost+":"+servicePort
	telemetryHost    = common.EnvString("TELEMETRY_HOST", "localhost")
	telemetryPort	 = common.EnvString("TELEMETRY_PORT", "4318")
	telemetryAddr    = telemetryHost+":"+telemetryPort
)

var tracer trace.Tracer

func main() {
	ctx := context.Background()
	tracerProvider, err := common.InitTracer(ctx, telemetryAddr, serviceName)
	if err != nil {
		log.Println(err)
	}
	defer tracerProvider.Shutdown(ctx)
	serviceTracer := tracerProvider.Tracer(serviceName)
	tracer = serviceTracer

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

	registry, instanceId, err := discovery.InitRegistryAndHandleIt(ctx, serviceName, serviceAddr)
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

	log.Println("listening on address: ", serviceAddr)
	if err := grpcServer.Serve(listener); err != nil {
		log.Fatal(err)
	}
}
