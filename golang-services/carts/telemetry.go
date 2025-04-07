package main

import (
	"context"
	"fmt"
	pb "ms/common/generated"

	"go.opentelemetry.io/otel/trace"
)

type TelemetryMiddleware struct {
	service CartsService
}

func NewTelemetryMiddleware(service CartsService) *TelemetryMiddleware {
	return &TelemetryMiddleware{
		service: service,
	}
}

func (t *TelemetryMiddleware) telemetryHandler(ctx context.Context, event string, options ...trace.EventOption) {
	span := trace.SpanFromContext(ctx)
	span.AddEvent(event, options...)
}

func (t *TelemetryMiddleware) GetUserCart(ctx context.Context, pb *pb.GetCartRequest) (*pb.Cart, error) {
	defer t.telemetryHandler(ctx, fmt.Sprintf("GetUserCart: %v", pb))

	return t.service.GetUserCart(ctx, pb)
}

func (t *TelemetryMiddleware) AddToCart(ctx context.Context, pb *pb.AddToCartRequest) (*pb.CartItem, error) {
	defer t.telemetryHandler(ctx, fmt.Sprintf("AddToCart: %v", pb))

	return t.service.AddToCart(ctx, pb)
}

func (t *TelemetryMiddleware) RemoveFromCart(ctx context.Context, pb *pb.RemoveFromCartRequest) (*pb.EmptyBody, error) {
	defer t.telemetryHandler(ctx, fmt.Sprintf("RemoveFromCart: %v", pb))

	return t.service.RemoveFromCart(ctx, pb)
}

func (t *TelemetryMiddleware) ChangeCartItemQuantity(ctx context.Context, pb *pb.ChangeCartItemQuantityRequest) (*pb.EmptyBody, error) {
	defer t.telemetryHandler(ctx, fmt.Sprintf("ChangeCartItemQuantity: %v", pb))

	return t.service.ChangeCartItemQuantity(ctx, pb)
}

func (t *TelemetryMiddleware) ClearCart(ctx context.Context, pb *pb.ClearCartRequest) (*pb.EmptyBody, error) {
	defer t.telemetryHandler(ctx, fmt.Sprintf("ClearCart: %v", pb))

	return t.service.ClearCart(ctx, pb)
}