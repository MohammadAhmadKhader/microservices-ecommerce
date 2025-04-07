package main

import (
	"context"
	"log"
	"ms/carts/cli"
	"ms/carts/gateway"
	"ms/common"
	"ms/common/broker"
	"ms/common/discovery"
	"net"
	"os"
	"slices"

	_ "github.com/joho/godotenv/autoload"
	"github.com/rs/zerolog"
	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.4.0"

	"github.com/grpc-ecosystem/go-grpc-prometheus"
	"google.golang.org/grpc"
)

var (
	serviceName   = "carts"
	serviceHost      = common.EnvString("SERVICE_HOST", "127.0.0.9")
	metricsPort      = common.EnvString("METRICS_PORT", "127.0.0.9")
	servicePort      = common.EnvString("SERVICE_PORT", "3001")
	serviceAddr  	 = serviceHost+":"+servicePort
	telemetryHost    = common.EnvString("TELEMETRY_HOST", "localhost")
	telemetryPort	 = common.EnvString("TELEMETRY_PORT", "4318")
	telemetryAddr    = telemetryHost+":"+telemetryPort
	logstashHost     = common.EnvString("LOGSTASH_HOST", "localhost")
	logstashPort     = common.EnvString("LOGSTASH_PORT", "5000")
	logstashAddr 	 = logstashHost+":"+logstashPort
)

var tracer trace.Tracer
var serviceLogger *zerolog.Logger

func main() {
	if slices.Contains(os.Args, "seed") {
		err := cli.ExecuteCommands()
		log.Println(err)
		return
	}

	ctx := context.Background()
	tracerProvider, err := common.InitTracer(ctx, telemetryAddr, serviceName, common.TracingOptions{
		ResourceAttributes: []attribute.KeyValue{
			semconv.DBSystemPostgreSQL,
		},
	})
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

	logger := common.NewServiceLogger(logstashAddr, serviceName)
	serviceLogger = logger

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
