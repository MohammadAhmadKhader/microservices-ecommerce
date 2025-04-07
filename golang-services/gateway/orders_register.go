package main

import (
	"ms/common"
	pb "ms/common/generated"
	"ms/gateway/middlewares"
	"ms/gateway/shared"
	"net/http"

	orderTypes "ms/gateway/types/orders"

	"go.opentelemetry.io/otel/attribute"
	"google.golang.org/grpc/status"
)

type CreateOrderPayload struct {
	OrderItems []*pb.OrderItem `json:"orderItems"`
}

func(h *handler) ordersRegister(mux *http.ServeMux) {
	Authenticate := middlewares.Authenticate
	// order
	mux.HandleFunc("POST /api/users/orders", Authenticate(h.authGateway, tracer)(h.HandleCreateOrder))
	mux.HandleFunc("GET /api/users/orders", Authenticate(h.authGateway, tracer)(h.HandleGettingOrders))
	mux.HandleFunc("GET /api/users/orders/{orderId}", Authenticate(h.authGateway, tracer)(h.HandlerGetOrderById))
}

func (h *handler) HandleCreateOrder(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	ctx, span := tracer.Start(ctx, "HandleCreateOrder Gateway")
	defer span.End()

	userId, err := common.ExtractUserID(ctx)
	if err != nil {
		shared.HandleSpanErr(&span, err)
		common.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	span.SetAttributes(attribute.Int("session.userId", int(userId)))

	res, err := h.ordersGateway.CreateOrder(ctx, &pb.CreateOrderRequest{})

	rStatus := status.Convert(err)
	if rStatus != nil {
		shared.HandleSpanErr(&span, err)
		common.HandleGrpcErr(err, rStatus, w, nil)
		return
	}

	span.SetAttributes(attribute.Stringer("response.order", res.Order))

	common.WriteJSON(w, http.StatusOK, map[string]any{"order": orderTypes.ConvertProtoOrderToOrder(res.Order)})
}

func (h *handler) HandleGettingOrders(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "HandleGettingOrders Gateway")
	defer span.End()
	
	page, limit, err := common.GetPagination(r);
	if err != nil {
		shared.HandleSpanErr(&span, err)
		common.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	orders, err := h.ordersGateway.GetOrders(ctx, &pb.GetOrdersRequest{
		Page: page,
		Limit: limit,
	})

	rStatus := status.Convert(err)
	if rStatus != nil {
		shared.HandleSpanErr(&span, err)
		common.HandleGrpcErr(err, rStatus, w, nil)
		return
	}

	span.SetAttributes(attribute.Stringer("response.orders", orders))

	common.WriteJSON(w, http.StatusOK, map[string]any{"orders": orders})
}

func (h *handler) HandlerGetOrderById(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "HandlerGetOrderById Gateway")
	defer span.End()
	
	orderId, err := GetPathValueAsInt(r, "orderId")
	if err != nil {
		shared.HandleSpanErr(&span, err)
		common.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	orderResp, err := h.ordersGateway.GetOrderById(ctx, &pb.GetOrderByIdRequest{
		ID: int32(orderId),
	})

	rStatus := status.Convert(err)
	if rStatus != nil {
		shared.HandleSpanErr(&span, err)
		common.HandleGrpcErr(err, rStatus, w, nil)
		return
	}

	order := orderTypes.ConvertProtoOrderToOrder(orderResp.Order)
	span.SetAttributes(attribute.Stringer("response.order", order))

	common.WriteJSON(w, http.StatusOK, map[string]any{"order": order})
}