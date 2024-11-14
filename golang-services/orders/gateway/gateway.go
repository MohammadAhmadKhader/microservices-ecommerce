package gateway

import (
	"context"
	"fmt"
	"log"

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
		log.Fatal("an error has ocurred during connection with products service: ", err)
	}
	defer conn.Close()

	productsService := pb.NewProductsServiceClient(conn)

	resp, err := productsService.FindProductsByIds(ctx, &pb.FindProductsByIdsRequest{Ids: productsIds})
	if err != nil {
		return nil, err
	}

	if len(resp.Products) != len(productsIds) {
		idsStr := utils.GetUnmatchedIds(productsIds, resp.Products)

		return nil, fmt.Errorf("order was not able to be created, products with the following ids: '%s' were not found", idsStr)
	}

	return resp.Products, nil
}
