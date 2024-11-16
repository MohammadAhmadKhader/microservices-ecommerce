package main

import (
	"context"
	pb "ms/common/generated"
	"ms/orders/models"

	"gorm.io/gorm"
)

type OrdersService interface {
	GetOrderById(context.Context, *pb.GetOrderByIdRequest) (*pb.Order, error)
	UpdateOrderStatus(ctx context.Context, p *pb.UpdateOrderStatusRequest) (*pb.Order, error)
	CreateOrder(context.Context, *pb.CreateOrderRequest) (*pb.Order, error)
}

type OrdersStore interface {
	GetOnePopulatedOrder(ctx context.Context, Id int) (*models.Order, error)
	GetOne(ctx context.Context, Id int) (*models.Order, error)
	Create(context.Context, *models.Order) (*models.Order, error)
	UpdateStatus(ctx context.Context, Id int, order *models.Order) (*models.Order, error)
	FetchOrderItems(ctx context.Context, Id int) ([]models.OrderItem, error)
	UpdateStatusTx(ctx context.Context,tx *gorm.DB, Id int, order *models.Order) (*models.Order, error)
	FetchOrderItemsTx(ctx context.Context, tx *gorm.DB, Id int) ([]models.OrderItem, error)
	UpdateStatusAndFetchItems(ctx context.Context, Id int, order *models.Order) (*models.Order, error)
}

type ProductsStockFailedOI = []struct{
	Quantity int `json:"quantity"`
	ProductId int `json:"productId"`
}
type ProductsStockFailed struct {
	OrderId int `json:"id"`
	UserId int `json:"userId"`
	TotalPrice float32 `json:"totalPrice"`
	Status string `json:"status"`
	OrderItems ProductsStockFailedOI `json:"orderItems"`
}