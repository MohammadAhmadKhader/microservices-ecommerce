package main

import (
	"context"

	"ms/common"
	pb "ms/common/generated"

	amqp "github.com/rabbitmq/amqp091-go"
	"google.golang.org/grpc"
)

type grpcHandler struct {
	service  CartsService
	amqpChan *amqp.Channel
	pb.UnimplementedCartsServiceServer
}

func NewGrpcHandler(grpcServer *grpc.Server, service CartsService, amqpChan *amqp.Channel) {
	handler := &grpcHandler{
		service:  service,
		amqpChan: amqpChan,
	}
	pb.RegisterCartsServiceServer(grpcServer, handler)
}

func (h *grpcHandler) GetUserCart(ctx context.Context, req *pb.GetCartRequest) (*pb.GetCartResponse, error) {
	ctx, span := tracer.Start(ctx, "GetUserCart GrpcHandler")
	defer span.End()

	protoCart, err := h.service.GetUserCart(ctx, req)
	if err != nil {
		return nil, common.CheckGrpcErrorOrInternal(err)
	}

	return &pb.GetCartResponse{Cart: protoCart}, nil
}


func (h *grpcHandler) AddToCart(ctx context.Context, req *pb.AddToCartRequest) (*pb.AddToCartResponse, error) {
	ctx, span := tracer.Start(ctx, "AddToCart GrpcHandler")
	defer span.End()

	protoCartItem, err := h.service.AddToCart(ctx, req)
	if err != nil {
		return nil, common.CheckGrpcErrorOrInternal(err)
	}

	addToCartResp := &pb.AddToCartResponse{CartItem: protoCartItem}

	return addToCartResp, nil
}

func (h *grpcHandler) RemoveFromCart(ctx context.Context, req *pb.RemoveFromCartRequest) (*pb.EmptyBody, error) {
	ctx, span := tracer.Start(ctx, "RemoveFromCart GrpcHandler")
	defer span.End()

	protoEmpty, err := h.service.RemoveFromCart(ctx, req)
	if err != nil {
		return nil, common.CheckGrpcErrorOrInternal(err)
	}

	return protoEmpty, nil
}

func (h *grpcHandler) ChangeCartItemQuantity(ctx context.Context, req *pb.ChangeCartItemQuantityRequest) (*pb.EmptyBody, error) {
	ctx, span := tracer.Start(ctx, "ChangeCartItemQuantity GrpcHandler")
	defer span.End()

	protoEmpty, err := h.service.ChangeCartItemQuantity(ctx, req)
	if err != nil {
		return nil, common.CheckGrpcErrorOrInternal(err)
	}
	
	return protoEmpty, nil
}

func (h *grpcHandler) ClearCart(ctx context.Context, req *pb.ClearCartRequest) (*pb.EmptyBody, error) {
	ctx, span := tracer.Start(ctx, "ClearCart GrpcHandler")
	defer span.End()

	protoEmpty, err := h.service.ClearCart(ctx, req)
	if err != nil {
		return nil, common.CheckGrpcErrorOrInternal(err)
	}
	
	return protoEmpty, nil
}