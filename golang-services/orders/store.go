package main

import (
	"context"
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
