package gateway

import (
	"context"
	"log"
	"ms/common/discovery"
	pb "ms/common/generated"

	"google.golang.org/grpc"
)

const cartsService = "carts"

type CartsGateway struct {
	registry discovery.ServiceRegistry
}

func NewCartsGateway(registry *discovery.Registry) *CartsGateway {
	return &CartsGateway{
		registry: registry,
	}
}

func (o *CartsGateway) GetCart(ctx context.Context, req *pb.GetCartRequest, opts ...grpc.CallOption) (*pb.GetCartResponse, error) {
	conn, err := discovery.ConnectService(ctx, cartsService, o.registry)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	cartsClient := pb.NewCartsServiceClient(conn)
	res, err := cartsClient.GetUserCart(ctx, req, opts...)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	return res, err
}

func (o *CartsGateway) AddToCart(ctx context.Context, req *pb.AddToCartRequest, opts ...grpc.CallOption) (*pb.AddToCartResponse, error) {
	conn, err := discovery.ConnectService(ctx, cartsService, o.registry)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	cartsClient := pb.NewCartsServiceClient(conn)
	res, err := cartsClient.AddToCart(ctx, req, opts...)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	return res, err
}

func (o *CartsGateway) RemoveFromCart(ctx context.Context, req *pb.RemoveFromCartRequest, opts ...grpc.CallOption) (*pb.EmptyBody, error) {
	conn, err := discovery.ConnectService(ctx, cartsService, o.registry)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	cartsClient := pb.NewCartsServiceClient(conn)
	validationResponse, err := cartsClient.RemoveFromCart(ctx, req, opts...)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	return validationResponse, err
}

func (o *CartsGateway) ChangeCartItemQuantity(ctx context.Context, req *pb.ChangeCartItemQuantityRequest, opts ...grpc.CallOption) (*pb.EmptyBody, error) {
	conn, err := discovery.ConnectService(ctx, cartsService, o.registry)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	cartsClient := pb.NewCartsServiceClient(conn)
	res, err := cartsClient.ChangeCartItemQuantity(ctx, req, opts...)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	return res, err
}

func (o *CartsGateway) ClearCart(ctx context.Context, req *pb.ClearCartRequest, opts ...grpc.CallOption) (*pb.EmptyBody, error) {
	conn, err := discovery.ConnectService(ctx, cartsService, o.registry)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	cartsClient := pb.NewCartsServiceClient(conn)
	res, err := cartsClient.ClearCart(ctx, req, opts...)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	return res, err
}