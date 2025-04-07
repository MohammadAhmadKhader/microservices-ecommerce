package gateway

import (
	"context"
	"log"

	"ms/common/discovery"
	pb "ms/common/generated"

	"google.golang.org/grpc"
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

func (o *OrdersGateway) CreateOrder(ctx context.Context, req *pb.CreateOrderRequest, opts ...grpc.CallOption) (*pb.CreateOrderResponse, error) {
	conn, err:=discovery.ConnectService(ctx, ordersService, o.registry)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	ordersClient := pb.NewOrderServiceClient(conn)
	validationResponse, err := ordersClient.CreateOrder(ctx, req, opts...)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	return validationResponse, err
}

func (o *OrdersGateway) GetOrders(ctx context.Context, req *pb.GetOrdersRequest, opts ...grpc.CallOption) (*pb.GetOrdersResponse, error) {
	conn, err:=discovery.ConnectService(ctx, ordersService, o.registry)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	ordersClient := pb.NewOrderServiceClient(conn)
	validationResponse, err := ordersClient.GetOrders(ctx, req, opts...)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	return validationResponse, err
}

func (o *OrdersGateway) GetOrderById(ctx context.Context, req *pb.GetOrderByIdRequest, opts ...grpc.CallOption) (*pb.GetOrderByIdResponse, error) {
	conn, err:=discovery.ConnectService(ctx, ordersService, o.registry)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	ordersClient := pb.NewOrderServiceClient(conn)
	validationResponse, err := ordersClient.GetOrderById(ctx, req, opts...)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	return validationResponse, err
}