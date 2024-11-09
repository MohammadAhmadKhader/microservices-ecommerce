package gateway

import (
	"context"
	"log"
	
	"ms/common/common-go/discovery"
	pb "ms/orders/generated"
	"sync"
)

type Gateway struct {
	registry discovery.ServiceRegistry
}

func (g *Gateway) GetProductsFromIds(ctx context.Context, productsIds []int32) ([]pb.Product, error) {
	conn, err := discovery.ConnectService(ctx, "products", g.registry)
	if err != nil {
		log.Fatal("an error has ocurred during connection with products service: ", err)
	}
	defer conn.Close()

	productsService := pb.NewProductsServiceClient(conn)

	var mu sync.Mutex
	var products = []pb.Product{}
	for _, productId := range productsIds {
		// ! must be changed to one single query fetch
		prod, err := productsService.FindOne(ctx, &pb.Id{Id: productId})
		if err != nil {
			
			return nil, err
		}

		if prod == nil {
			log.Printf("product with id: '%v' was not found during order creation",prod.Id)
			return nil, err
		}
		mu.Lock()
		products = append(products, *prod)
		mu.Unlock()
	}

	return products, nil
}

func NewGateway(registry *discovery.Registry) *Gateway {
	return &Gateway{
		registry: registry,
	}
}