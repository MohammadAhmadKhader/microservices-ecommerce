package models

import pb "ms/common/generated"

type OrderItem struct {
	ID        int     `json:"id,omitempty" gorm:"primarykey;autoIncrement"`
	OrderID   uint    `json:"orderId" gorm:"index;not null"`
	UnitPrice float32 `json:"unitPrice,omitempty"`
	Quantity  int     `json:"quantity"`
	ProductID int     `json:"productId"`
}

func (oi *OrderItem) ToProto() *pb.OrderItem {
	return &pb.OrderItem{
		ID:        int32(oi.ID),
		Quantity:  int32(oi.Quantity),
		UnitPrice: oi.UnitPrice,
		ProductId: int32(oi.ProductID),
	}
}
