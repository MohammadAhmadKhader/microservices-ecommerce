package main

import (
	"context"

	"ms/common"
	pb "ms/common/generated"
	"ms/orders/gateway"
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

func (s *service) GetOrders(ctx context.Context, p *pb.GetOrdersRequest) (*pb.GetOrdersResponse, error) {
	ctx, span := tracer.Start(ctx, "GetOrders OrdersService")
	defer span.End()

	protoOrders :=  make([]*pb.Order, 0)
	orders, err := s.store.GetOrders(ctx, int(p.GetPage()), int(p.GetLimit()))
	if err != nil {
		return nil, err
	}

	for _, order := range orders {
		protoOrders = append(protoOrders, order.ToProto())
	}

	resp := &pb.GetOrdersResponse{
		Page: p.GetPage(),
		Limit: p.GetLimit(),
		Count: int32(len(orders)),
		Orders: protoOrders,
	}

	return resp, nil
}

func (s *service) CreateOrder(ctx context.Context, p *pb.CreateOrderRequest) (*pb.Order, error) {
	ctx, span := tracer.Start(ctx, "CreateOrder OrdersService")
	defer span.End()
	
	var productIds = []int32{}
	for _, item := range p.Items {
		productIds = append(productIds, item.ID)
	}

	_, err := s.productsGateway.GetProductsFromIds(ctx, productIds)
	if err != nil {
		utils.HandleSpanErr(&span, err)
		return nil, err
	}

	span.AddEvent("Returned response from productsGateway")
	err = utils.ValidateOrder(p)
	if err != nil {
		utils.HandleSpanErr(&span, err)
		return nil, common.ErrInvalidArgument(err.Error())
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
	ctx, span := tracer.Start(ctx, "GetOrderById OrdersService")
	defer span.End()

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
	var returnedOrder *models.Order
	
	if order.Status == models.Completed {
		order, err = s.store.UpdateStatusAndFetchItems(ctx, id, order)
		if err != nil {
			return nil, err
		}

		returnedOrder = order
	} else {
		order, err = s.store.UpdateStatus(ctx, id, order)
		if err != nil {
			return nil, err
		}

		returnedOrder = order
	}

	protoOrder := returnedOrder.ToProto()

	return protoOrder, nil
}