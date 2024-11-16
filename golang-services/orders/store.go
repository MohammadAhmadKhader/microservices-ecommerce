package main

import (
	"context"
	"log"
	"ms/orders/models"

	"gorm.io/gorm"
)

type store struct {
	DB *gorm.DB
}

func NewStore(db *gorm.DB) *store {
	return &store{DB: db}
}

func (s *store) Create(ctx context.Context, order *models.Order) (*models.Order, error) {
	err := s.DB.Create(order).Error
	if err != nil {
		return nil, err
	}

	return order, nil
}

func (s *store) GetOnePopulatedOrder(ctx context.Context, Id int) (*models.Order, error) {
	var order models.Order
	err := s.DB.Preload("OrderItems").First(&order, Id).Error
	if err != nil {
		return nil, err
	}

	return &order, nil
}

func (s *store) GetOne(ctx context.Context, Id int) (*models.Order, error) {
	var order models.Order
	err := s.DB.First(&order, Id).Error
	if err != nil {
		return nil, err
	}

	return &order, nil
}

func (s *store) UpdateStatus(ctx context.Context, Id int, order *models.Order) (*models.Order, error) {
	err := s.DB.Where("id = ?", Id).Select("Status").Updates(order).Error
	if err != nil {
		return nil, err
	}

	return order, nil
}

func (s *store) FetchOrderItems(ctx context.Context, Id int) ([]models.OrderItem, error) {
	var orderItems []models.OrderItem
	err := s.DB.Model(&orderItems).Where("orderId = ?", Id).Find(&orderItems).Error
	if err != nil {
		return nil, err
	}

	return orderItems, nil
}

func (s *store) UpdateStatusTx(ctx context.Context,tx *gorm.DB, Id int, order *models.Order) (*models.Order, error) {
	err := tx.Where("id = ?", Id).Select("Status").Updates(order).Error
	if err != nil {
		return nil, err
	}

	return order, nil
}


// transaction is required here because later on this will be sent to the message broker for transactions
func (s *store) FetchOrderItemsTx(ctx context.Context, tx *gorm.DB, Id int) ([]models.OrderItem, error) {
	var orderItems []models.OrderItem
	err := tx.Model(&orderItems).Where("order_id = ?", Id).Find(&orderItems).Error
	if err != nil {
		return nil, err
	}

	return orderItems, nil
}

func (s *store) UpdateStatusAndFetchItems(ctx context.Context, Id int, order *models.Order) (*models.Order, error) {
	var returnedOrder *models.Order
	err := s.DB.Transaction(func(tx *gorm.DB) error {
		order, err := s.UpdateStatusTx(ctx, tx, Id, order)
		if err != nil {
			return err
		}

		orderItems, err := s.FetchOrderItemsTx(ctx, tx, Id)
		if err != nil {
			return err
		}
		order.OrderItems = orderItems
		returnedOrder = order

		return nil
	})
	if err != nil {
		log.Println(err)
		return nil, err
	}

	return returnedOrder, nil
}
