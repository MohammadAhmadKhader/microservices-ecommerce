package main

import (
	"context"
	"log"
	"ms/orders/models"
	"ms/orders/utils"

	"go.opentelemetry.io/otel/attribute"
	"gorm.io/gorm"
)

type store struct {
	DB *gorm.DB
}

func NewStore(db *gorm.DB) *store {
	return &store{DB: db}
}

func (s *store) Create(ctx context.Context, order *models.Order) (*models.Order, error) {
	ctx, span := tracer.Start(ctx, "Create OrdersStore")
	defer span.End()

	err := s.DB.WithContext(ctx).Create(order).Error
	if err != nil {
		utils.HandleSpanErr(&span, err)
		return nil, err
	}

	return order, nil
}

func (s *store) GetOnePopulatedOrder(ctx context.Context, Id int) (*models.Order, error) {
	ctx, span := tracer.Start(ctx, "GetOnePopulatedOrder OrdersStore")
	defer span.End()
	
	var order models.Order
	err := s.DB.WithContext(ctx).Preload("OrderItems").First(&order, Id).Error
	if err != nil {
		utils.HandleSpanErr(&span, err)
		return nil, err
	}

	span.SetAttributes(
        attribute.Float64("order.total", float64(order.TotalPrice)),
        attribute.Int("order.items.count", len(order.OrderItems)),
    )

	return &order, nil
}

func (s *store) GetOne(ctx context.Context, Id int) (*models.Order, error) {
	ctx, span := tracer.Start(ctx, "GetOne OrdersStore")
	defer span.End()

	span.SetAttributes(
        attribute.Int("order.id", Id),
        attribute.String("db.operation", "First"),
    )

	var order models.Order
	err := s.DB.WithContext(ctx).First(&order, Id).Error
	if err != nil {
		utils.HandleSpanErr(&span, err)
		return nil, err
	}

	span.SetAttributes(
        attribute.Float64("order.total", float64(order.TotalPrice)),
        attribute.Int("order.items.count", len(order.OrderItems)),
    )

	return &order, nil
}

func (s *store) GetOrders(ctx context.Context, page, limit int) ([]models.Order, error) {
	ctx, span := tracer.Start(ctx, "GetOrders OrdersStore")
	defer span.End()
	span.SetAttributes(
        attribute.String("db.operation", "Find"),
    )

	var offset = (page - 1) * limit
	var orders []models.Order
	err := s.DB.WithContext(ctx).Offset(offset).Limit(limit).
	Preload("OrderItems").
	Find(&orders).Error
	if err != nil {
		utils.HandleSpanErr(&span, err)
		return nil, err
	}

	log.Println("after order returned")
	span.SetAttributes(
        attribute.Int("orders.count", len(orders)),
    )

	return orders, nil
}

func (s *store) UpdateStatus(ctx context.Context, Id int, order *models.Order) (*models.Order, error) {
	ctx, span := tracer.Start(ctx, "GetOne OrdersStore")
	defer span.End()

	err := s.DB.WithContext(ctx).Where("id = ?", Id).Select("Status").Updates(order).Error
	if err != nil {
		utils.HandleSpanErr(&span, err)
		return nil, err
	}

	return order, nil
}

func (s *store) FetchOrderItems(ctx context.Context, Id int) ([]models.OrderItem, error) {
	ctx, span := tracer.Start(ctx, "FetchOrderItems OrdersStore")
	defer span.End()
	
	var orderItems []models.OrderItem
	err := s.DB.WithContext(ctx).Model(&orderItems).Where("orderId = ?", Id).Find(&orderItems).Error
	if err != nil {
		utils.HandleSpanErr(&span, err)
		return nil, err
	}

	return orderItems, nil
}

func (s *store) UpdateStatusTx(ctx context.Context,tx *gorm.DB, Id int, order *models.Order) (*models.Order, error) {
	ctx, span := tracer.Start(ctx, "UpdateStatusTx OrdersStore")
	defer span.End()
	
	err := tx.WithContext(ctx).Where("id = ?", Id).Select("Status").Updates(order).Error
	if err != nil {
		utils.HandleSpanErr(&span, err)
		return nil, err
	}

	return order, nil
}


// transaction is required here because later on this will be sent to the message broker for transactions
func (s *store) FetchOrderItemsTx(ctx context.Context, tx *gorm.DB, Id int) ([]models.OrderItem, error) {
	ctx, span := tracer.Start(ctx, "FetchOrderItemsTx OrdersStore")
	defer span.End()

	var orderItems []models.OrderItem
	err := tx.WithContext(ctx).Model(&orderItems).Where("order_id = ?", Id).Find(&orderItems).Error
	if err != nil {
		utils.HandleSpanErr(&span, err)
		return nil, err
	}

	return orderItems, nil
}

func (s *store) UpdateStatusAndFetchItems(ctx context.Context, Id int, order *models.Order) (*models.Order, error) {
	ctx, span := tracer.Start(ctx, "UpdateStatusAndFetchItems OrdersStore")
	defer span.End()

	var returnedOrder *models.Order
	err := s.DB.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		order, err := s.UpdateStatusTx(ctx, tx, Id, order)
		if err != nil {
			utils.HandleSpanErr(&span, err)
			return err
		}

		orderItems, err := s.FetchOrderItemsTx(ctx, tx, Id)
		if err != nil {
			utils.HandleSpanErr(&span, err)
			return err
		}
		order.OrderItems = orderItems
		returnedOrder = order

		return nil
	})
	if err != nil {
		utils.HandleSpanErr(&span, err)
		log.Println(err)
		return nil, err
	}

	return returnedOrder, nil
}
