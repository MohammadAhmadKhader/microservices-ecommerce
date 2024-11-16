package main

import (
	"context"
	"encoding/json"
	"log"

	"ms/common/broker"
	pb "ms/common/generated"
	"ms/orders/models"

	amqp "github.com/rabbitmq/amqp091-go"
	"google.golang.org/grpc"
)

type grpcHandler struct {
	service  OrdersService
	amqpChan *amqp.Channel
	pb.UnimplementedOrderServiceServer
}

func NewGrpcHandler(grpcServer *grpc.Server, service OrdersService, amqpChan *amqp.Channel) {
	handler := &grpcHandler{
		service:  service,
		amqpChan: amqpChan,
	}
	pb.RegisterOrderServiceServer(grpcServer, handler)
}

func (h *grpcHandler) GetOrderById(ctx context.Context, orderReq *pb.GetOrderByIdRequest) (*pb.GetOrderByIdResponse, error) {
	order, err := h.service.GetOrderById(ctx, orderReq)
	if err != nil {
		return nil, err
	}

	orderResp := &pb.GetOrderByIdResponse{Order: order}

	return orderResp, nil
}

func (h *grpcHandler) CreateOrder(ctx context.Context, orderReq *pb.CreateOrderRequest) (*pb.Order, error) {
	return h.service.CreateOrder(ctx, orderReq)
}

func (h *grpcHandler) UpdateOrderStatus(ctx context.Context, orderReq *pb.UpdateOrderStatusRequest) (*pb.UpdateOrderStatusResponse, error) {
	order, err := h.service.UpdateOrderStatus(ctx, orderReq)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	sentOrder := models.Order{
		ID:         int(order.ID),
		UserID:     uint(order.UserId),
		Status:     models.Status(order.Status.String()),
		TotalPrice: order.TotalPrice,
	}

	if order.Status == pb.Status_Completed {
		var orderItems []models.OrderItem
		for _, item := range order.Items {
			orderItems = append(orderItems, models.OrderItem{
				Quantity:  int(item.Quantity),
				ProductID: int(item.ID),
			})

			sentOrder.OrderItems = orderItems
		}
	}

	marshalledOrder, err := json.Marshal(sentOrder)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	orderResp := &pb.UpdateOrderStatusResponse{Order: order}

	if orderResp.Order.Status == pb.Status_Completed {
		err = h.amqpChan.PublishWithContext(ctx, string(broker.ProductsExchange), string(broker.RK_OrderCompleted), false, false, amqp.Publishing{
			ContentType:  "application/json",
			Body:         marshalledOrder,
			DeliveryMode: amqp.Persistent,
		})

		if err != nil {
			log.Println(err)
			return nil, err
		}
	}

	return orderResp, err
}
