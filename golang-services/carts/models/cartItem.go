package models

import (
	pb "ms/common/generated"
	"time"

	"google.golang.org/protobuf/types/known/timestamppb"
)

type CartItem struct {
	ID        uint      `json:"id" gorm:"primarykey;autoIncrement"`
	UserID    uint      `json:"userId" gorm:"uniqueIndex:idx_user_product;not null"`
	ProductID uint      `json:"productId" gorm:"uniqueIndex:idx_user_product;not null"`
	Quantity  uint      `json:"quantity" gorm:"type()"`
	CreatedAt time.Time `json:"createdAt" gorm:"autoCreateTime:nano"`
}

func NewCartItem(id, userId, productId, quantity uint, createdAt time.Time) *CartItem {
	return &CartItem{
		ID:        id,
		UserID:    id,
		ProductID: productId,
		Quantity:  quantity,
		CreatedAt: createdAt,
	}
}

func (ci *CartItem) ToProto() *pb.CartItem {
	var cartItem = &pb.CartItem{
		Id:        int32(ci.ID),
		ProductId: int32(ci.ProductID),
		Quantity:  int32(ci.Quantity),
		UserId:    int32(ci.UserID),
		CreatedAt: timestamppb.New(ci.CreatedAt),
	}

	return cartItem
}

type Cart struct {
	CartItems []CartItem `json:"cartItems"`
}

func NewCart(cartItems []CartItem) *Cart {
	return &Cart{
		CartItems: cartItems,
	}
}

func (c *Cart) ToProto() *pb.Cart{
	var protoCart = &pb.Cart{}
	for i := 0; i < len(c.CartItems); i ++ {
		protoCart.CartItems = append(protoCart.CartItems, c.CartItems[i].ToProto())
	}

	return protoCart
}