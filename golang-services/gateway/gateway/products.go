package gateway

import (
	"context"

	"ms/common/discovery"
	pb "ms/common/generated"

	"google.golang.org/grpc"
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

func(p *ProductsGateway) FindOne(ctx context.Context, req *pb.FindOneProductRequest, opts ...grpc.CallOption) (*pb.FindOneProductResponse, error) {
	conn, err :=discovery.ConnectService(ctx, productsService, p.registry)
	if err != nil {
		return nil, err
	}

	productsClient := pb.NewProductsServiceClient(conn)

	return productsClient.FindOne(ctx, req, opts...)
}

func(p *ProductsGateway) Find(ctx context.Context, req *pb.FindAllProductsRequest, opts ...grpc.CallOption) (*pb.FindAllProductsResponse, error) {
	conn, err :=discovery.ConnectService(ctx, productsService, p.registry)
	if err != nil {
		return nil, err
	}

	productsClient := pb.NewProductsServiceClient(conn)

	return productsClient.FindAll(ctx, req, opts...)
}

func(p *ProductsGateway) Create(ctx context.Context, req *pb.CreateProductRequest, opts ...grpc.CallOption) (*pb.CreateProductResponse, error) {
	conn, err :=discovery.ConnectService(ctx, productsService, p.registry)
	if err != nil {
		return nil, err
	}

	productsClient := pb.NewProductsServiceClient(conn)

	return productsClient.Create(ctx, req, opts...)
}

func(p *ProductsGateway) Update(ctx context.Context, req *pb.UpdateProductRequest, opts ...grpc.CallOption) (*pb.UpdateProductResponse, error) {
	conn, err :=discovery.ConnectService(ctx, productsService, p.registry)
	if err != nil {
		return nil, err
	}

	productsClient := pb.NewProductsServiceClient(conn)

	return productsClient.Update(ctx, req, opts...)
}

func(p *ProductsGateway) DeleteOne(ctx context.Context, req *pb.DeleteOneProductRequest, opts ...grpc.CallOption) (*pb.EmptyBody, error) {
	conn, err :=discovery.ConnectService(ctx, productsService, p.registry)
	if err != nil {
		return nil, err
	}

	productsClient := pb.NewProductsServiceClient(conn)

	return productsClient.DeleteOne(ctx, req, opts...)
}