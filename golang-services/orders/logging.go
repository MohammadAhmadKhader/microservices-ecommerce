package main

import (
	"context"
	"ms/common/generated"
	"time"

	"github.com/rs/zerolog"
	"google.golang.org/protobuf/proto"
)

type LoggingMiddleware struct {
	service OrdersService
	logger *zerolog.Logger
}


func NewLoggingMiddleware(service OrdersService, serviceLogger *zerolog.Logger) *LoggingMiddleware {
	return &LoggingMiddleware{
		service: service,
		logger: serviceLogger,
	}
}

func (l *LoggingMiddleware) loggingHandler(start time.Time, handlerName string, payload proto.Message) {
	payloadDict := zerolog.Dict()
	for fieldDescriptor,refVal := range payload.ProtoReflect().Range {
		payloadDict.Any(fieldDescriptor.JSONName(), refVal.String())
	}

	l.logger.Info().Str("handler", handlerName).Dur("durationMs", time.Since(start)).Dict("payload", payloadDict).Msg("")
}

func (l *LoggingMiddleware) GetOrders(ctx context.Context, req *pb.GetOrdersRequest) (*pb.GetOrdersResponse, error) {
	start := time.Now()
	defer l.loggingHandler(start, "GetOrders", req)

	return l.service.GetOrders(ctx, req)
}

func (l *LoggingMiddleware) GetOrderById(ctx context.Context, req *pb.GetOrderByIdRequest) (*pb.Order, error) {
	start := time.Now()
	defer l.loggingHandler(start, "GetOrderById", req)
	
	return l.service.GetOrderById(ctx, req)
}

func (l *LoggingMiddleware) UpdateOrderStatus(ctx context.Context, req *pb.UpdateOrderStatusRequest) (*pb.Order, error) {
	start := time.Now()
	defer l.loggingHandler(start, "UpdateOrderStatus", req)

	return l.service.UpdateOrderStatus(ctx, req)
}

func (l *LoggingMiddleware) CreateOrder(ctx context.Context, req *pb.CreateOrderRequest) (*pb.Order, error) {
	start := time.Now()
	defer l.loggingHandler(start, "CreateOrder", req)

	return l.service.CreateOrder(ctx, req)
}