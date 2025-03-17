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

func(p *ProductsGateway) FindOne(ctx context.Context, req *pb.FindOneProductRequest) (*pb.FindOneProductResponse, error) {
	conn, err :=discovery.ConnectService(ctx, productsService, p.registry)
	if err != nil {
		return nil, err
	}

	productsClient := pb.NewProductsServiceClient(conn)

	return productsClient.FindOne(ctx, req)
}

func(p *ProductsGateway) Find(ctx context.Context, req *pb.FindAllProductsRequest) (*pb.FindAllProductsResponse, error) {
	conn, err :=discovery.ConnectService(ctx, productsService, p.registry)
	if err != nil {
		return nil, err
	}

	productsClient := pb.NewProductsServiceClient(conn)

	return productsClient.FindAll(ctx, req)
}

func(p *ProductsGateway) Create(ctx context.Context, req *pb.CreateProductRequest) (*pb.CreateProductResponse, error) {
	conn, err :=discovery.ConnectService(ctx, productsService, p.registry)
	if err != nil {
		return nil, err
	}

	productsClient := pb.NewProductsServiceClient(conn)

	return productsClient.Create(ctx, req)
}

func(p *ProductsGateway) Update(ctx context.Context, req *pb.UpdateProductRequest) (*pb.UpdateProductResponse, error) {
	conn, err :=discovery.ConnectService(ctx, productsService, p.registry)
	if err != nil {
		return nil, err
	}

	productsClient := pb.NewProductsServiceClient(conn)

	return productsClient.Update(ctx, req)
}

func(p *ProductsGateway) DeleteOne(ctx context.Context, req *pb.DeleteOneProductRequest) (*pb.EmptyBody, error) {
	conn, err :=discovery.ConnectService(ctx, productsService, p.registry)
	if err != nil {
		return nil, err
	}

	productsClient := pb.NewProductsServiceClient(conn)

	return productsClient.DeleteOne(ctx, req)
}