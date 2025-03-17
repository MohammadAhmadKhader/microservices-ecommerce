package gateway

import (
	"context"
	"log"

	"ms/common"
	"ms/common/discovery"
	pb "ms/common/generated"
	"ms/orders/utils"
)

type Gateway struct {
	registry discovery.ServiceRegistry
}

func NewGateway(registry *discovery.Registry) *Gateway {
	return &Gateway{
		registry: registry,
	}
}

func (g *Gateway) GetProductsFromIds(ctx context.Context, productsIds []int32) ([]*pb.Product, error) {
	conn, err := discovery.ConnectService(ctx, "products", g.registry)
	if err != nil {
		log.Printf("an error has ocurred during connection with products service: %v\n", err.Error())
		
		return nil, common.ErrInternal()
	}
	defer conn.Close()

	productsService := pb.NewProductsServiceClient(conn)

	resp, err := productsService.FindProductsByIds(ctx, &pb.FindProductsByIdsRequest{Ids: productsIds})
	if err != nil {
		return nil, common.CheckGrpcErrorOrInternal(err)
	}

	if len(resp.Products) != len(productsIds) {
		idsStr := utils.GetUnmatchedIds(productsIds, resp.Products)
		log.Printf("order was not able to be created, products with the following ids: '%s' were not found\n", idsStr)

		return nil, common.ErrInternal()
	}

	return resp.Products, nil
}
