package main

import (
	"context"
	"fmt"
	pb "ms/common/generated"

	"go.opentelemetry.io/otel/trace"
)

type TelemetryMiddleware struct {
	service OrdersService
}

func NewTelemetryMiddleware(service OrdersService) *TelemetryMiddleware {
	return &TelemetryMiddleware{
		service: service,
	}
}

func (t *TelemetryMiddleware) telemetryHandler(ctx context.Context, event string, options ...trace.EventOption) {
	span := trace.SpanFromContext(ctx)
	span.AddEvent(event, options...)
}

func (t *TelemetryMiddleware) GetOrderById(ctx context.Context, pb *pb.GetOrderByIdRequest) (*pb.Order, error) {
	defer t.telemetryHandler(ctx, fmt.Sprintf("GetOrderById: %v", pb))

	return t.service.GetOrderById(ctx, pb)
}

func (t *TelemetryMiddleware) UpdateOrderStatus(ctx context.Context, pb *pb.UpdateOrderStatusRequest) (*pb.Order, error) {
	defer t.telemetryHandler(ctx, fmt.Sprintf("UpdateOrderStatus: %v", pb))

	return t.service.UpdateOrderStatus(ctx, pb)
}

func (t *TelemetryMiddleware) CreateOrder(ctx context.Context, pb *pb.CreateOrderRequest) (*pb.Order, error) {
	defer t.telemetryHandler(ctx, fmt.Sprintf("CreateOrder: %v", pb))

	return t.service.CreateOrder(ctx, pb)
}