package discovery

import (
	"context"
	"log"
	"math/rand"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func ConnectService(ctx context.Context, serviceName string, serviceRegistry ServiceRegistry) (*grpc.ClientConn, error) {
	addresses, err := serviceRegistry.Discover(ctx, serviceName)
	if err != nil {
		log.Println("an error has ocurred during discovering service: ", err)
		return nil, err
	}

	addressesCount := len(addresses)

	conn, err := grpc.NewClient(addresses[rand.Intn(addressesCount)], grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Println(err)
		return nil, err
	}

	return conn, nil
}
