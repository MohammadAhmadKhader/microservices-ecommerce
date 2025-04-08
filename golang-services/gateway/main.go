package main

import (
	"context"
	"log"
	"net/http"

	"ms/common"
	"ms/common/discovery"

	"ms/gateway/gateway"
	"ms/gateway/shared"

	_ "github.com/joho/godotenv/autoload"
)

var (
	serviceName 	 = shared.ServiceName
	metricsPort      = shared.MetricsPort
	serviceHost      = shared.ServiceHost
	serviceAddr  	 = shared.ServiceAddr
	ConsulAddr 		 = shared.ConsulAddr

	tracer = shared.Tracer
)

func main() {
	ctx := context.Background()
	
	tracerProvider, err := shared.InitTracer(ctx)
	if err != nil {
		log.Fatal(err)
	}
	defer tracerProvider.Shutdown(ctx)

	registry, instanceId, err := discovery.InitRegistryAndHandleIt(ctx, serviceName, serviceAddr, ConsulAddr)
	if err != nil {
		log.Fatal(err)
	}
	defer registry.Deregister(ctx, instanceId)
	
	ordersGateway := gateway.NewOrdersGateway(registry)
	productsGateway := gateway.NewProductsGateway(registry)
	authGateway := gateway.NewAuthGateway(registry)
	cartsGateway := gateway.NewCartsGateway(registry)

	mux := http.NewServeMux()
	handler := NewHandler(ordersGateway, productsGateway, authGateway, cartsGateway)
	handler.registerRoutes(mux)

	common.HttpInitMetrics(mux, serviceHost, metricsPort)
	log.Printf("gateway server listening at address %v\n", serviceAddr)
	if err := http.ListenAndServe(serviceAddr, common.MetricsHandler(mux)); err != nil {
		log.Fatal("Failed to start the http server")
	}
}
