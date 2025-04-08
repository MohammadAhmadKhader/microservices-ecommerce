package main

import (
	"context"
	"log"

	"ms/common"
	pb "ms/common/generated"
	"ms/orders/gateway"
	"ms/orders/models"
	"ms/orders/shared"

	"google.golang.org/grpc/metadata"
)

type service struct {
	gateway *gateway.Gateway
	store           OrdersStore
}

func NewService(store OrdersStore, gateway *gateway.Gateway) *service {
	return &service{
		store:           store,
		gateway: gateway,
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
	
	md , err := common.ExtractMD(ctx)
	if err != nil {
		shared.HandleSpanErr(&span, err)
		return nil, err
	}

	ctx = metadata.NewOutgoingContext(ctx, md)
	
	cartRes, err := s.gateway.GetUserCart(ctx)
	if err != nil {
		shared.HandleSpanErr(&span, err)
		return nil, err
	}
	span.AddEvent("Returned response from carts service")
	
	productsIds := shared.CollectProductsIds(cartRes.CartItems)

	log.Println(productsIds,"products Id's")
	products, err := s.gateway.GetProductsFromIds(ctx, productsIds)
	if err != nil {
		shared.HandleSpanErr(&span, err)
		return nil, err
	}
	span.AddEvent("Returned response from products service")
	log.Println(products)

	err = shared.ValidateReturnedProducts(products, cartRes.CartItems)
	if err != nil {
		shared.HandleSpanErr(&span, err)
		return nil, common.ErrInvalidArgument(err.Error())
	}

	productsPricesMap := shared.MapProdutsIdsToPrice(products)

	var orderItems = []models.OrderItem{}
	var totalPrice float32 = 0
	for i := 0; i < len(cartRes.CartItems); i++ {
		currProdPrice := productsPricesMap[cartRes.CartItems[i].GetProductId()]

		orderItems = append(orderItems, models.OrderItem{
			ProductID: int(cartRes.CartItems[i].GetProductId()),
			UnitPrice: currProdPrice,
			Quantity:  int(cartRes.CartItems[i].GetQuantity()),
		})

		totalPrice += (float32(cartRes.CartItems[i].GetQuantity()) * currProdPrice)
	}

	userId, err := common.ExtractUserID(ctx)
	if err != nil {
		shared.HandleSpanErr(&span, err)
		// we have set here internal instead of unauthenticated assuming user/customer
		// should not have reached here without userId
		return nil, err
	}

	order := &models.Order{
		UserID:     uint(userId),
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
	ctx, span := tracer.Start(ctx, "UpdateOrderStatus OrdersService")
	defer span.End()

	id := int(p.GetId())
	order, err := s.store.GetOne(ctx, id)
	if err != nil {
		shared.HandleSpanErr(&span, err)
		return nil, err
	}

	order.Status = models.Status(p.Status.String())
	var returnedOrder *models.Order
	
	if order.Status == models.Completed {
		order, err = s.store.UpdateStatusAndFetchItems(ctx, id, order)
		if err != nil {
			shared.HandleSpanErr(&span, err)
			return nil, err
		}

		returnedOrder = order
	} else {
		order, err = s.store.UpdateStatus(ctx, id, order)
		if err != nil {
			shared.HandleSpanErr(&span, err)
			return nil, err
		}

		returnedOrder = order
	}

	protoOrder := returnedOrder.ToProto()

	return protoOrder, nil
}