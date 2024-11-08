package models

import pb "ms/orders/generated"

type OrderItem struct {
	ID        int     `json:"id" gorm:"primarykey;autoIncrement"`
	OrderID   uint    `json:"orderId" gorm:"index;not null"`
	UnitPrice float32 `json:"unitPrice"`
	Quantity  int     `json:"quantity"`
	ProductID int     `json:"productId"`
}

func (oi *OrderItem) ToProto() *pb.Item {
	return &pb.Item{
		ID:        int32(oi.ID),
		Quantity:  int32(oi.Quantity),
		UnitPrice: oi.UnitPrice,
	}
}
