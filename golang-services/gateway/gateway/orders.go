package gateway

import (
	"context"
	"log"
	
	"ms/common/discovery"
	pb "ms/common/generated"
)

type OrdersGateway struct {
	registry discovery.ServiceRegistry
}

const ordersService = "orders"

func NewOrdersGateway(registry *discovery.Registry) *OrdersGateway {
	return &OrdersGateway{
		registry: registry,
	}
}

func (o *OrdersGateway) CreateOrder(ctx context.Context, req *pb.CreateOrderRequest) (*pb.Order, error) {
	conn, err:=discovery.ConnectService(ctx, ordersService, o.registry)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	ordersClient := pb.NewOrderServiceClient(conn)
	validationResponse, err := ordersClient.CreateOrder(context.Background(), req)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	return validationResponse, err
}