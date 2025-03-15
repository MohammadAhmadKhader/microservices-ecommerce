package main

import (
	"context"
	"log"
	"net/http"

	"ms/common"
	"ms/common/discovery"

	"ms/gateway/gateway"

	_ "github.com/joho/godotenv/autoload"
	"go.opentelemetry.io/otel/trace"
)

var (
	serviceName = "gateway"
	metricsPort           = common.EnvString("METRICS_PORT", "")
	serviceHost      = common.EnvString("SERVICE_HOST", "127.0.0.3")
	servicePort      = common.EnvString("SERVICE_PORT", "8080")
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
		log.Fatal(err)
	}

	t := tracerProvider.Tracer(serviceName)
	tracer = t

	registry, instanceId, err := discovery.InitRegistryAndHandleIt(ctx, serviceName, serviceAddr)
	if err != nil {
		log.Fatal(err)
	}

	defer registry.Deregister(ctx, instanceId)
	
	ordersGateway := gateway.NewOrdersGateway(registry)
	productsGateway := gateway.NewProductsGateway(registry)
	authGateway := gateway.NewAuthGateway(registry)

	mux := http.NewServeMux()
	handler := NewHandler(ordersGateway, productsGateway, authGateway)
	handler.registerRoutes(mux)

	common.HttpInitMetrics(mux, serviceHost, metricsPort)
	log.Printf("gateway server listening at address %v\n", serviceAddr)
	if err := http.ListenAndServe(serviceAddr, common.MetricsHandler(mux)); err != nil {
		log.Fatal("Failed to start the http server")
	}
}
