package main

import (
	"context"
	"fmt"

	"ms/carts/gateway"
	"ms/carts/models"
	"ms/carts/utils"
	"ms/common"
	pb "ms/common/generated"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
)

type service struct {
	productsGateway *gateway.Gateway
	store           CartsStore
}

func NewService(store CartsStore, productsGateway *gateway.Gateway) *service {
	return &service{
		store:           store,
		productsGateway: productsGateway,
	}
}

func (s *service) GetUserCart(ctx context.Context, p *pb.GetCartRequest) (*pb.Cart, error) {
	ctx, span := tracer.Start(ctx, "GetUserCart CartsService")
	defer span.End()

	userId, err := common.ExtractUserID(ctx)
	if err != nil {
		utils.HandleSpanErr(&span, err)
		return nil, err
	}
	span.SetAttributes(attribute.Int("userId", int(userId)))
	
	cart, err := s.store.GetCart(ctx, uint(userId))
	if err != nil {
		utils.HandleSpanErr(&span, err)
		return nil, err
	}

	var protoCartItems = make([]*pb.CartItem, 0)
	for _, cartItem := range cart.CartItems {
		protoCartItems = append(protoCartItems, cartItem.ToProto())
	}

	protoCart := &pb.Cart{CartItems: protoCartItems}

	return protoCart, nil
}

func (s *service) AddToCart(ctx context.Context, p *pb.AddToCartRequest) (*pb.CartItem, error) {
	ctx, span := tracer.Start(ctx, "AddToCart CartsService")
	defer span.End()

	userId, err := common.ExtractUserID(ctx)
	if err != nil {
		utils.HandleSpanErr(&span, err)
		return nil, err
	}
	span.SetAttributes(attribute.Int("userId", int(userId)))

	span.AddEvent("sending request to products service method: GetProductById", trace.WithAttributes(attribute.Int("productId", int(p.GetProductId()))))
	product, err := s.productsGateway.GetProductById(ctx, p.GetProductId())
	if err != nil {
		span.SetAttributes(attribute.String("error.message", err.Error()))
		utils.HandleSpanErr(&span, err)

		return nil, err
	}

	createdCartItem, err := s.store.Create(ctx, &models.CartItem{
		UserID: uint(userId),
		ProductID: uint(product.GetId()),
		Quantity: uint(p.GetQuantity()),
	})
	if err != nil {
		utils.HandleSpanErr(&span, err)
		return nil, err
	}

	protoCartItem := createdCartItem.ToProto()

	return protoCartItem, nil
}

func (s *service) RemoveFromCart(ctx context.Context, p *pb.RemoveFromCartRequest) (*pb.EmptyBody, error) {
	ctx, span := tracer.Start(ctx, "RemoveFromCart CartsService")
	defer span.End()

	userId, err := common.ExtractUserID(ctx)
	if err != nil {
		utils.HandleSpanErr(&span, err)
		return nil, err
	}
	span.SetAttributes(attribute.Int("userId", int(userId)))

	err = s.store.RemoveCartItem(ctx, uint(p.GetCartItemId()), uint(userId))
	if err != nil {
		return nil, err
	}

	return &pb.EmptyBody{}, nil
}

func (s *service) ChangeCartItemQuantity(ctx context.Context, pbReq *pb.ChangeCartItemQuantityRequest) (*pb.EmptyBody, error) {
	ctx, span := tracer.Start(ctx, "ChangeCartItemQuantity CartsService")
	defer span.End()

	var operation = ""
	if pbReq.Operation == pb.Sign_PLUS {
		operation = "PLUS"
	} else if pbReq.Operation == pb.Sign_MINUS {
		operation = "MINUS"
	} else {
		err := fmt.Errorf("invalid Operation enum type received: %v", pbReq.Operation)
		utils.HandleSpanErr(&span, err)
		return nil, err
	}

	userId, err := common.ExtractUserID(ctx)
	if err != nil {
		utils.HandleSpanErr(&span, err)
		return nil, err
	}
	span.SetAttributes(attribute.Int("userId", int(userId)))

	err = s.store.ChangeCartItemQuantity(ctx, uint(pbReq.GetCartItemId()), uint(userId) ,operation)
	if err != nil {
		return nil, err
	}

	return &pb.EmptyBody{}, nil
}

func (s *service) ClearCart(ctx context.Context, pbReq *pb.ClearCartRequest) (*pb.EmptyBody, error) {
	ctx, span := tracer.Start(ctx, "ClearCart CartsService")
	defer span.End()

	userId, err := common.ExtractUserID(ctx)
	if err != nil {
		utils.HandleSpanErr(&span, err)
		return nil, err
	}
	span.SetAttributes(attribute.Int("userId", int(userId)))

	err = s.store.ClearCart(ctx, uint(userId))
	if err != nil {
		return nil, err
	}

	return &pb.EmptyBody{}, nil
}