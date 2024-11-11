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
	log.Printf("service: '%v' have these addresses: '%v' count: '%v' \n", serviceName, addresses, addressesCount)

	return grpc.NewClient(addresses[rand.Intn(addressesCount)], grpc.WithTransportCredentials(insecure.NewCredentials()))
}
