package main

import (
	"context"
	pb "ms/common/generated"
	"os"
	"time"

	"github.com/rs/zerolog"
)

type LoggingMiddleware struct {
	service OrdersService
	logger zerolog.Logger
}


func NewLoggingMiddleware(service OrdersService) *LoggingMiddleware {
	logger := zerolog.New(os.Stdout).With().Timestamp().Logger()
	
	return &LoggingMiddleware{
		service: service,
		logger: logger,
	}
}

func (l *LoggingMiddleware) loggingHandler(start time.Time, handlerName string) {
	l.logger.Info().Str("handler", handlerName).Dur("duration-s", time.Since(start)).Msg("")
}

func (l *LoggingMiddleware) GetOrderById(ctx context.Context, pb *pb.GetOrderByIdRequest) (*pb.Order, error) {
	start := time.Now()
	defer l.loggingHandler(start, "GetOrderById")
	
	return l.service.GetOrderById(ctx, pb)
}

func (l *LoggingMiddleware) UpdateOrderStatus(ctx context.Context, pb *pb.UpdateOrderStatusRequest) (*pb.Order, error) {
	start := time.Now()
	defer l.loggingHandler(start, "UpdateOrderStatus")

	return l.service.UpdateOrderStatus(ctx, pb)
}

func (l *LoggingMiddleware) CreateOrder(ctx context.Context, pb *pb.CreateOrderRequest) (*pb.Order, error) {
	start := time.Now()
	defer l.loggingHandler(start, "CreateOrder")

	return l.service.CreateOrder(ctx, pb)
}