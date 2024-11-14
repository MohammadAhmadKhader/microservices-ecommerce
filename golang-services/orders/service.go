package main

import (
	"context"

	"ms/orders/gateway"
	pb "ms/common/generated"
	"ms/orders/models"
	"ms/orders/utils"
)

type service struct {
	productsGateway *gateway.Gateway
	store           OrdersStore
}

func NewService(store OrdersStore, productsGateway *gateway.Gateway) *service {
	return &service{
		store:           store,
		productsGateway: productsGateway,
	}
}

func (s *service) CreateOrder(ctx context.Context, p *pb.CreateOrderRequest) (*pb.Order, error) {
	var productIds = []int32{}
	for _, item := range p.Items {
		productIds = append(productIds, item.ID)
	}

	_, err := s.productsGateway.GetProductsFromIds(ctx, productIds)
	if err != nil {
		return nil, err
	}

	err = utils.ValidateOrder(p)
	if err != nil {
		return nil, err
	}

	var orderItems = []models.OrderItem{}
	var totalPrice float32 = 0
	for i := 0; i < len(p.Items); i++ {
		orderItems = append(orderItems, models.OrderItem{
			ProductID: int(p.Items[i].ID),
			OrderID:   1,
			UnitPrice: float32(p.Items[i].UnitPrice),
			Quantity:  int(p.Items[i].Quantity),
		})

		totalPrice += (float32(p.Items[i].Quantity) * p.Items[i].UnitPrice)
	}

	order := &models.Order{
		UserID:     uint(p.UserId),
		OrderItems: orderItems,
		TotalPrice: totalPrice,
	}

	createdOrder, err := s.store.Create(ctx, order)
	if err != nil {
		return nil, err
	}

	protoOrder := createdOrder.ToProto()

	return protoOrder, nil
}

func (s *service) GetOrderById(ctx context.Context, p *pb.GetOrderByIdRequest) (*pb.Order, error) {
	order, err := s.store.GetOnePopulatedOrder(ctx, int(p.ID))
	if err != nil {
		return nil, err
	}

	protoOrder := order.ToProto()

	return protoOrder, nil
}

func (s *service) UpdateOrderStatus(ctx context.Context, p *pb.UpdateOrderStatusRequest) (*pb.Order, error) {
	id := int(p.GetId())
	order, err := s.store.GetOne(ctx, id)
	if err != nil {
		return nil, err
	}

	order.Status = models.Status(p.Status.String())
	order, err = s.store.UpdateStatus(ctx, id, order)
	if err != nil {
		return nil, err
	}

	protoOrder := order.ToProto()

	return protoOrder, nil
}