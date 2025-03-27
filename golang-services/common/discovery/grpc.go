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

func ConnectService(ctx context.Context, serviceName string, serviceRegistry ServiceRegistry, dialOptions ...grpc.DialOption) (*grpc.ClientConn, error) {
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

	mergedDialOptions := append(
		[]grpc.DialOption{
			grpc.WithTransportCredentials(insecure.NewCredentials()),
			grpc.WithStatsHandler(otelgrpc.NewClientHandler()),
		},
		dialOptions...
	)

	conn, err := grpc.NewClient(
		addresses[rand.Intn(addressesCount)], 
		mergedDialOptions...
	)

	if err != nil {
		log.Println(err)
		return nil, err
	}

	return conn, nil
}
