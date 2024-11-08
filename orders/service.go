package main

import (
	"context"
	"ms/common/common-go"
	pb "ms/orders/generated"
	"ms/orders/models"
)

type service struct {
	store OrdersStore
}

func NewService(store OrdersStore) *service {
	return &service{store: store}
}

func (s *service) CreateOrder(ctx context.Context, p *pb.CreateOrderRequest) (*pb.Order, error) {
	err := s.ValidateOrder(p)
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

func (s *service) ValidateOrder(pb *pb.CreateOrderRequest) error {
	if len(pb.Items) == 0 {
		return common.ErrNoItems
	}

	return nil
}

func (s *service) CollectProductsIds(pb *pb.CreateOrderRequest) []int {
	var productsIds []int
	for _, item := range pb.Items {
		productsIds = append(productsIds, int(item.ID))
	}

	return productsIds
}
