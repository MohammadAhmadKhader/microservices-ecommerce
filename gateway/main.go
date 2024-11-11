package main

import (
	"context"
	"log"
	"net/http"

	"ms/common/common-go"
	"ms/common/common-go/discovery"

	"ms/gateway/gateway"

	_ "github.com/joho/godotenv/autoload"
)

var (
	serviceName ="gateway"
	httpAddr           = common.EnvString("HTTP_ADDR", ":3000")
)

func main() {
	ctx := context.Background()

	registry, instanceId, err := discovery.InitRegistryAndHandleIt(ctx, serviceName, httpAddr)
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

	log.Printf("gateway server listening at port %v\n", httpAddr)
	if err := http.ListenAndServe(httpAddr, mux); err != nil {
		log.Fatal("Failed to start the http server")
	}
}
