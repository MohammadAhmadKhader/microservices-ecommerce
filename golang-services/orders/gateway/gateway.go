package gateway

import (
	"context"
	"fmt"
	"log"

	"ms/common"
	"ms/common/discovery"
	pb "ms/common/generated"
	"ms/orders/shared"

	"google.golang.org/grpc"
)

type Gateway struct {
	registry discovery.ServiceRegistry
}

func NewGateway(registry *discovery.Registry) *Gateway {
	return &Gateway{
		registry: registry,
	}
}

func (g *Gateway) GetProductsFromIds(ctx context.Context, productsIds []int32, opts ...grpc.CallOption) ([]*pb.Product, error) {
	conn, err := discovery.ConnectService(ctx, "products", g.registry)
	if err != nil {
		log.Printf("an error has ocurred during connection with products service: %v\n", err.Error())
		
		return nil, common.ErrInternal()
	}
	defer conn.Close()

	productsService := pb.NewProductsServiceClient(conn)

	resp, err := productsService.FindProductsByIds(ctx, &pb.FindProductsByIdsRequest{Ids: productsIds}, opts...)
	if err != nil {
		return nil, common.CheckGrpcErrorOrInternal(err)
	}

	if len(resp.Products) != len(productsIds) {
		idsStr := shared.GetUnmatchedIds(productsIds, resp.Products)
		log.Printf("order was not able to be created, products with the following ids: '%s' were not found\n", idsStr)

		return nil, common.ErrInternal()
	}

	return resp.Products, nil
}

func (g *Gateway) GetUserCart(ctx context.Context, opts ...grpc.CallOption) (*pb.Cart, error) {
	conn, err := discovery.ConnectService(ctx, "carts", g.registry)
	if err != nil {
		log.Printf("an error has ocurred during connection with carts service: %v\n", err.Error())
		
		return nil, common.ErrInternal()
	}
	defer conn.Close()

	cartsService := pb.NewCartsServiceClient(conn)

	resp, err := cartsService.GetUserCart(ctx, &pb.GetCartRequest{}, opts...)
	if err != nil {
		return nil, common.CheckGrpcErrorOrInternal(err)
	}

	if len(resp.Cart.CartItems) == 0 {
		userId, err := common.ExtractUserID(ctx)
		if err != nil {
			return nil, common.ErrInternal()
		}

		errMsg := fmt.Sprintf("user with id: '%v' has an empty cart", userId)
		return nil, common.ErrFailedPrecondition(errMsg)
	}

	return resp.Cart, nil
}