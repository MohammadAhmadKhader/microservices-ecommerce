package discovery

import (
	"context"
	"fmt"
	"log"
	"math/rand"

	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
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
	if addressesCount == 0 {
		err := fmt.Errorf("no service with name: '%v' was found", serviceName)
		return nil, err
	}

	conn, err := grpc.NewClient(
		addresses[rand.Intn(addressesCount)], 
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithStatsHandler(otelgrpc.NewClientHandler()),
	)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	return conn, nil
}
