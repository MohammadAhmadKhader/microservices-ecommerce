package orders

import (
	"fmt"
	pb "ms/common/generated"
)

type Order struct {
	ID int32 `json:"id"`
	UserID int32 `json:"userId"`
	Status string `json:"status"`
	TotalPrice float32 `json:"totalPrice"` 
	OrderItems []*OrderItem `json:"orderItems"`
}

type OrderItem struct {
	ID int32 `json:"id"`
	Quantity int32 `json:"quantity"`
	UnitPrice float32 `json:"unitPrice"` 
	ProductId int32 `json:"productId"`
}

func (o *Order) String() string {
	// Build a simple string representation of the Order
	orderItemsStr := ""
	for _, item := range o.OrderItems {
		orderItemsStr += fmt.Sprintf("{ID: %d, Quantity: %d, UnitPrice: %.2f} ", item.ID, item.Quantity, item.UnitPrice)
	}

	return fmt.Sprintf(
		"Order{ID: %d, UserID: %d, Status: %s, TotalPrice: %.2f, OrderItems: [%s]}",
		o.ID,
		o.UserID,
		o.Status,
		o.TotalPrice,
		orderItemsStr,
	)
}

func ConvertProtoOrderToOrder(protoOrder *pb.Order) *Order {
	var orderItems = make([]*OrderItem, 0)
	for _, oi := range protoOrder.OrderItems {
		orderItems = append(orderItems, ConvertProtoOrderItemToOrderItem(oi)) 
	}

	order := Order{
		ID: protoOrder.GetID(),
		UserID: protoOrder.GetUserId(),
		Status: protoOrder.GetStatus().String(),
		TotalPrice: protoOrder.GetTotalPrice(),
		OrderItems: orderItems,
	}

	return &order
}

func ConvertProtoOrderItemToOrderItem(pbOrderItem *pb.OrderItem) *OrderItem {
	orderItem := &OrderItem{
		ID: pbOrderItem.GetID(),
		UnitPrice: pbOrderItem.GetUnitPrice(),
		Quantity: pbOrderItem.GetQuantity(),
		ProductId: pbOrderItem.GetProductId(),
	}
	
	return orderItem
}