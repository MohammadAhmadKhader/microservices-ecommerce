package main

import (
	"context"
	pb "ms/common/generated"
	"ms/carts/models"
)

type CartsService interface {
	GetUserCart(context.Context, *pb.GetCartRequest) (*pb.Cart, error)
	AddToCart(context.Context, *pb.AddToCartRequest) (*pb.CartItem, error)
	RemoveFromCart(context.Context, *pb.RemoveFromCartRequest) (*pb.EmptyBody, error)
	ChangeCartItemQuantity(context.Context, *pb.ChangeCartItemQuantityRequest) (*pb.EmptyBody, error)
	ClearCart(context.Context, *pb.ClearCartRequest) (*pb.EmptyBody, error)
}

type CartsStore interface {
	GetCart(ctx context.Context, userId uint) (*models.Cart, error)
	Create(context.Context, *models.CartItem) (*models.CartItem, error)
	RemoveCartItem(ctx context.Context, cartItemId, userId uint) (error)
	ChangeCartItemQuantity(ctx context.Context, cartItemId, userId uint ,operation string) (error)
	ClearCart(ctx context.Context, userId uint) (error)
}

type OrderCompletedMessage struct {
	OrderId uint `json:"orderId"`
	UserId uint `json:"userId"`
}