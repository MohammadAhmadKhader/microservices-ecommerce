package gateway

import (
	"context"
	"log"

	"ms/common"
	"ms/common/discovery"
	pb "ms/common/generated"
)

type Gateway struct {
	registry discovery.ServiceRegistry
}

func NewGateway(registry *discovery.Registry) *Gateway {
	return &Gateway{
		registry: registry,
	}
}

func (g *Gateway) GetProductById(ctx context.Context, productId int32) (*pb.Product, error) {
	conn, err := discovery.ConnectService(ctx, "products", g.registry)
	if err != nil {
		log.Printf("an error has ocurred during connection with products service: %v\n", err.Error())
		
		return nil, common.ErrInternal()
	}
	defer conn.Close()

	productsService := pb.NewProductsServiceClient(conn)

	resp, err := productsService.FindOne(ctx, &pb.FindOneProductRequest{Id: productId})
	if err != nil {
		return nil, common.CheckGrpcErrorOrInternal(err)
	}

	return resp.Product, nil
}
