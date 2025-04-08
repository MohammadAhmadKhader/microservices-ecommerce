package main

import (
	"context"
	"errors"
	"fmt"
	"ms/carts/models"
	"ms/carts/shared"
	"ms/common"

	"go.opentelemetry.io/otel/attribute"
	"gorm.io/gorm"
)

type store struct {
	DB *gorm.DB
}

func NewStore(db *gorm.DB) *store {
	return &store{DB: db}
}

func (s *store) GetCart(ctx context.Context, userId uint) (*models.Cart, error) {
	ctx, span := tracer.Start(ctx, "GetCart CartsStore")
	defer span.End()

	var cartItems []models.CartItem
	err := s.DB.WithContext(ctx).Model(models.CartItem{}).Where(&models.CartItem{
		UserID: userId,
	}).Find(&cartItems).Error
	if err != nil {
		shared.HandleSpanErr(&span, err)

		return nil, err
	}

	cart := models.NewCart(cartItems)

	return cart, nil
}

func (s *store) GetCartItem(ctx context.Context, cartItemId uint, userId uint) (*models.CartItem, error) {
	ctx, span := tracer.Start(ctx, "GetCartItem CartsStore")
	defer span.End()

	var cartItem models.CartItem
	err := s.DB.WithContext(ctx).Model(models.CartItem{}).First(&cartItem, cartItemId).Error
	if err != nil {
		shared.HandleSpanErr(&span, err)
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, common.ErrNotFound("cartItemId", cartItemId)
		}

		return nil, err
	}

	return &cartItem, nil
}

func (s *store) Create(ctx context.Context, cartItem *models.CartItem) (*models.CartItem, error) {
	ctx, span := tracer.Start(ctx, "Create CartsStore")
	defer span.End()

	err := s.DB.WithContext(ctx).Model(models.CartItem{}).Create(&cartItem).Error
	if err != nil {
		shared.HandleSpanErr(&span, err)

		return nil, err
	}

	return cartItem, nil
}

func (s *store) RemoveCartItem(ctx context.Context, cartItemId uint, userId uint) (error) {
	ctx, span := tracer.Start(ctx, "RemoveCartItem CartsStore")
	defer span.End()

	var cartItem models.CartItem
	err := s.DB.WithContext(ctx).Model(models.CartItem{}).Where("id = ? AND user_id = ?", cartItemId, userId).First(&cartItem).Error
	if err != nil {
		shared.HandleSpanErr(&span, err)
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return common.ErrNotFound("cartItemId", cartItemId)
		}

		return err
	}

	err = s.DB.WithContext(ctx).Model(models.CartItem{}).Delete(&cartItem).Error
	if err != nil {
		return err
	}

	return nil
}

func (s *store) ChangeCartItemQuantity(ctx context.Context, cartItemId uint, userId uint, operation string) (error) {
	ctx, span := tracer.Start(ctx, "ChangeCartItemQuantity CartsStore")
	defer span.End()

	var cartItem models.CartItem
	err := s.DB.WithContext(ctx).Model(models.CartItem{}).
	Where("id = ? AND user_id = ?", cartItemId, userId).First(&cartItem).Error
	if err != nil {
		shared.HandleSpanErr(&span, err)
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return common.ErrNotFound("cartItemId", cartItemId)
		}

		return err
	}

	if operation == "PLUS" {
		cartItem.Quantity += 1

	} else if operation == "MINUS" && cartItem.Quantity > 1 {
		cartItem.Quantity -= 1
		
	} else if cartItem.Quantity <= 1 && operation == "MINUS" {
		var err = fmt.Errorf("cart item with id '%v' has the least allowed quantity", cartItemId)
		span.SetAttributes(attribute.String("error.message", err.Error()))
		shared.HandleSpanErr(&span, err)

		return err
	}

	err = s.DB.WithContext(ctx).Where("id = ? AND user_id = ?", cartItemId, userId).Model(models.CartItem{}).Save(&cartItem).Error
	if err != nil {
		shared.HandleSpanErr(&span, err)
		return err
	}

	return nil
}

func (s *store) ClearCart(ctx context.Context,userId uint) (error) {
	ctx, span := tracer.Start(ctx, "ClearCart CartsStore")
	defer span.End()

	var cartItems []models.CartItem
	err := s.DB.WithContext(ctx).Model(models.CartItem{}).Where("user_id = ?", userId).Find(&cartItems).Error
	if err != nil {
		shared.HandleSpanErr(&span, err)
		return err
	}

	if len(cartItems) == 0 {
		err := fmt.Errorf("user cart already empty")
		shared.HandleSpanErr(&span, err)
		return err
	}

	cartItemsIds := []uint{}
	for _, cartItem := range cartItems {
		cartItemsIds = append(cartItemsIds, cartItem.ID)
	}

	err = s.DB.WithContext(ctx).Model(models.CartItem{}).Delete(&models.CartItem{}, cartItemsIds).Error
	if err != nil {
		return err
	}

	return nil
}