package carts

import (
	pb "ms/common/generated"
	"time"
)

type ChangeCartItemQuantityBody struct {
	Operation string `json:"operation"`
}

type CartItemResponse struct {
	Id            int32 `json:"id"`
	ProductId     int32 `json:"productId"`
	Quantity      int32 `json:"quantity"`
	UserId 		  int32 `json:"userId"`
	CreatedAt     time.Time `json:"createdAt"`
}

func ConvertCartItemToResponse(cartItem *pb.CartItem) CartItemResponse {
	return CartItemResponse{
		Id: cartItem.GetId(),
		ProductId: cartItem.GetProductId(),
		Quantity: cartItem.GetQuantity(),
		UserId: cartItem.GetUserId(),
		CreatedAt: cartItem.CreatedAt.AsTime(),
	}
}