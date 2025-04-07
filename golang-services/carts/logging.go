package main

import (
	"context"
	"ms/common/generated"
	"time"

	"github.com/rs/zerolog"
	"google.golang.org/protobuf/proto"
)

type LoggingMiddleware struct {
	service CartsService
	logger  *zerolog.Logger
}

func NewLoggingMiddleware(service CartsService, serviceLogger *zerolog.Logger) *LoggingMiddleware {
	return &LoggingMiddleware{
		service: service,
		logger:  serviceLogger,
	}
}

func (l *LoggingMiddleware) loggingHandler(start time.Time, handlerName string, payload proto.Message) {
	payloadDict := zerolog.Dict()
	for fieldDescriptor, refVal := range payload.ProtoReflect().Range {
		payloadDict.Any(fieldDescriptor.JSONName(), refVal.String())
	}

	l.logger.Info().Str("handler", handlerName).Dur("durationMs", time.Since(start)).Dict("payload", payloadDict).Msg("")
}

func (l *LoggingMiddleware) GetUserCart(ctx context.Context, req *pb.GetCartRequest) (*pb.Cart, error) {
	start := time.Now()
	defer l.loggingHandler(start, "GetUserCart", req)

	return l.service.GetUserCart(ctx, req)
}

func (l *LoggingMiddleware) AddToCart(ctx context.Context, req *pb.AddToCartRequest) (*pb.CartItem, error) {
	start := time.Now()
	defer l.loggingHandler(start, "AddToCart", req)

	return l.service.AddToCart(ctx, req)
}

func (l *LoggingMiddleware) ChangeCartItemQuantity(ctx context.Context, req *pb.ChangeCartItemQuantityRequest) (*pb.EmptyBody, error) {
	start := time.Now()
	defer l.loggingHandler(start, "ChangeCartItemQuantity", req)

	return l.service.ChangeCartItemQuantity(ctx, req)
}

func (l *LoggingMiddleware) RemoveFromCart(ctx context.Context, req *pb.RemoveFromCartRequest) (*pb.EmptyBody, error) {
	start := time.Now()
	defer l.loggingHandler(start, "RemoveFromCart", req)

	return l.service.RemoveFromCart(ctx, req)
}

func (l *LoggingMiddleware) ClearCart(ctx context.Context, req *pb.ClearCartRequest) (*pb.EmptyBody, error) {
	start := time.Now()
	defer l.loggingHandler(start, "ClearCart", req)

	return l.service.ClearCart(ctx, req)
}