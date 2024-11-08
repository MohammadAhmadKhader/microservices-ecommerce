package main

import (
	"context"
	pb "ms/orders/generated"
	"ms/orders/models"
)

type OrdersService interface {
	GetOrderById(context.Context, *pb.GetOrderByIdRequest) (*pb.Order, error)
	UpdateOrderStatus(ctx context.Context, p *pb.UpdateOrderStatusRequest) (*pb.Order, error)
	CreateOrder(context.Context, *pb.CreateOrderRequest) (*pb.Order, error)
	ValidateOrder(*pb.CreateOrderRequest) error
	CollectProductsIds(pb *pb.CreateOrderRequest) []int
}

type OrdersStore interface {
	GetOnePopulatedOrder(ctx context.Context, Id int) (*models.Order, error)
	GetOne(ctx context.Context, Id int) (*models.Order, error)
	Create(context.Context, *models.Order) (*models.Order, error)
	UpdateStatus(ctx context.Context, Id int, order *models.Order) (*models.Order, error)
}