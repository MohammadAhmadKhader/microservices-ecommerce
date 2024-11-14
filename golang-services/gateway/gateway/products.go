package gateway

import (
	"context"

	"ms/common/discovery"
	pb "ms/common/generated"
)

type ProductsGateway struct {
	registry discovery.ServiceRegistry
}

const productsService = "products"

func NewProductsGateway(registry *discovery.Registry) *ProductsGateway {
	return &ProductsGateway{
		registry: registry,
	}
}

func(p *ProductsGateway) FindOne(ctx context.Context, req *pb.Id) (*pb.Product, error) {
	conn, err :=discovery.ConnectService(ctx, productsService, p.registry)
	if err != nil {
		return nil, err
	}

	productsClient := pb.NewProductsServiceClient(conn)

	return productsClient.FindOne(ctx, req)
}

func(p *ProductsGateway) Find(ctx context.Context, req *pb.FindAll) (*pb.FindAllResponse, error) {
	conn, err :=discovery.ConnectService(ctx, productsService, p.registry)
	if err != nil {
		return nil, err
	}

	productsClient := pb.NewProductsServiceClient(conn)

	return productsClient.Find(ctx, req)
}

func(p *ProductsGateway) Create(ctx context.Context, req *pb.CreateProduct) (*pb.Product, error) {
	conn, err :=discovery.ConnectService(ctx, productsService, p.registry)
	if err != nil {
		return nil, err
	}

	productsClient := pb.NewProductsServiceClient(conn)

	return productsClient.Create(ctx, req)
}

func(p *ProductsGateway) Update(ctx context.Context, req *pb.UpdateProduct) (*pb.Product, error) {
	conn, err :=discovery.ConnectService(ctx, productsService, p.registry)
	if err != nil {
		return nil, err
	}

	productsClient := pb.NewProductsServiceClient(conn)

	return productsClient.Update(ctx, req)
}

func(p *ProductsGateway) DeleteOne(ctx context.Context, req *pb.Id) (*pb.EmptyBody, error) {
	conn, err :=discovery.ConnectService(ctx, productsService, p.registry)
	if err != nil {
		return nil, err
	}

	productsClient := pb.NewProductsServiceClient(conn)

	return productsClient.DeleteOne(ctx, req)
}