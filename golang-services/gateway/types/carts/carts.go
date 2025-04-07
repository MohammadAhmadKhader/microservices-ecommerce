package carts

import (
	pb "ms/common/generated"
)

type CartResponse struct {
	CartItems []CartItemResponse `json:"cartItems"`
}

func ConvertCartToResponse(cart *pb.Cart) CartResponse {
	items := cart.GetCartItems()
	if items == nil {
		returnedItems := []CartItemResponse{}
		return CartResponse{CartItems: returnedItems}
	}

	itemsResponse := []CartItemResponse{}
	for _, item := range items {
		itemResponse := CartItemResponse{
			Id: item.GetId(),
			ProductId: item.GetProductId(),
			Quantity: item.GetQuantity(),
			CreatedAt: item.GetCreatedAt().AsTime(),
			UserId: item.GetUserId(),
		}

		itemsResponse = append(itemsResponse, itemResponse)
	}

	return CartResponse{
		CartItems: itemsResponse,
	}
}
