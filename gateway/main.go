package main

import (
	"log"
	"net/http"

	"ms/common/common-go"

	pb "ms/gateway/generated"
	redis "ms/gateway/generated"

	_ "github.com/joho/godotenv/autoload"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

var (
	httpAddr           = common.EnvString("HTTP_ADDR", ":3000")
	orderServiceAddr   = "localhost:2000"
	productServiceAddr = "localhost:3001"
	authServiceAddr    = "localhost:3003"
	redisServiceAddr   = "localhost:6379"
)

// this will act as load balancer and it will implement the grpc connection to the other services.
func main() {

	orderConn, err := grpc.Dial(orderServiceAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Println(err)
		err = nil
	} else {
		log.Println("Dialing with order service at: ", orderServiceAddr)
		defer orderConn.Close()
	}

	productConn, err := grpc.Dial(productServiceAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Println(err)
		err = nil
	} else {
		log.Println("Dialing with product service at: ", productServiceAddr)
		defer productConn.Close()
	}

	authConn, err := grpc.Dial(authServiceAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Println(err)
		err = nil
	} else {
		log.Println("Dialing with auth service at: ", authServiceAddr)
		defer authConn.Close()
	}

	redisConn, err := grpc.Dial(redisServiceAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Println(err)
		err = nil
	} else {
		log.Println("Dialing with redis service at: ", redisServiceAddr)
		defer authConn.Close()
	}

	ordersClient := pb.NewOrderServiceClient(orderConn)
	productsClient := pb.NewProductsServiceClient(productConn)
	authClient := pb.NewAuthServiceClient(authConn)
	redisClient := redis.NewSessionsServiceClient(redisConn)

	mux := http.NewServeMux()
	handler := NewHandler(ordersClient, productsClient, authClient, redisClient)
	handler.registerRoutes(mux)

	log.Printf("gateway server listening at port %v\n", httpAddr)
	if err := http.ListenAndServe(httpAddr, mux); err != nil {
		log.Fatal("Failed to start the http server")
	}
}
