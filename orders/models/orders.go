package models

import (
	pb "ms/orders/generated"
)

type Status string

const (
	Pending   Status = "Pending"
	Completed Status = "Completed"
	Cancelled Status = "Cancelled"
)

var orderStatusMap = map[Status]int32{
	Pending:   0,
	Completed: 1,
	Cancelled: 2,
}

func (s *Status) GetEnumNum() int32 {
	return orderStatusMap[*s]
}

func (s *Status) Scan(value interface{}) error {
	stringValue := string(value.([]byte))
	*s = Status(stringValue)
	return nil
}

type Order struct {
	ID         int         `json:"id" gorm:"primarykey;autoIncrement"`
	UserID     uint        `json:"userId" gorm:"index;not null"`
	TotalPrice float32     `json:"totalPrice" gorm:"check: total_price > 0;type:decimal(7,2)"`
	Status     Status      `json:"status" gorm:"default:Pending;size:16;not null;index;type:enum('Pending', 'Cancelled', 'Completed')"`
	OrderItems []OrderItem `json:"orderItems,omitempty" gorm:"foreignkey:OrderID;constraint:OnDelete:CASCADE"`
}

func (o *Order) ToProto() *pb.Order {
	var orderItems = []*pb.Item{}
	for i := 0; i < len(o.OrderItems); i++ {
		orderItems = append(orderItems, &pb.Item{
			ID:        int32(o.OrderItems[i].ID),
			Quantity:  int32(o.OrderItems[i].Quantity),
			UnitPrice: o.OrderItems[i].UnitPrice,
		})
	}

	orderStatus, validStatus := pb.Status_value[string(o.Status)]
	if !validStatus {
		orderStatus = int32(pb.Status_UNKNOWN)
	}

	return &pb.Order{
		ID:         int32(o.ID),
		Status:     pb.Status(orderStatus),
		Items:      orderItems,
		UserId:     int32(o.UserID),
		TotalPrice: o.TotalPrice,
	}
}
