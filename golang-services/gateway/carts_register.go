package main

import (
	"errors"
	"fmt"
	"ms/common"
	pb "ms/common/generated"
	"ms/gateway/middlewares"
	"ms/gateway/shared"
	"net/http"

	cartsTypes "ms/gateway/types/carts"

	"go.opentelemetry.io/otel/attribute"
	"google.golang.org/grpc/status"
)

func (h *handler) cartsRegister(mux *http.ServeMux) {
	Authenticate := middlewares.Authenticate

	mux.HandleFunc("GET /api/carts", Authenticate(h.authGateway, tracer)(h.HandleGettingUserCart))
	mux.HandleFunc("POST /api/carts", Authenticate(h.authGateway, tracer)(h.HandleAddToCart))
	mux.HandleFunc("PATCH /api/carts/{id}", Authenticate(h.authGateway, tracer)(h.HandleChangeCartItemQuantity))
	mux.HandleFunc("DELETE /api/carts/{id}", Authenticate(h.authGateway, tracer)(h.HandleRemoveFromCart))
	mux.HandleFunc("DELETE /api/carts", Authenticate(h.authGateway, tracer)(h.HandleClearCart))
}

func (h *handler) HandleGettingUserCart(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "HandleGettingUserCart Gateway")
	defer span.End()
	
	resp, err := h.cartsGateway.GetCart(ctx, &pb.GetCartRequest{})
	rStatus := status.Convert(err)
	if rStatus != nil {
		shared.HandleSpanErr(&span, err)
		common.HandleGrpcErr(err, rStatus, w, nil)
		return
	}

	common.WriteJSON(w, http.StatusOK, map[string]any{"cart": cartsTypes.ConvertCartToResponse(resp.GetCart())})
}

func (h *handler) HandleAddToCart(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "HandleAddToCart Gateway")
	defer span.End()

	var body pb.AddToCartRequest
	err := common.ReadJSON(r, &body)
	if err != nil {
		shared.HandleSpanErr(&span, err)
		common.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}
	span.SetAttributes(attribute.Stringer("payload", &body))
	
	resp, err := h.cartsGateway.AddToCart(ctx, &body)
	rStatus := status.Convert(err)
	if rStatus != nil {
		shared.HandleSpanErr(&span, err)
		common.HandleGrpcErr(err, rStatus, w, nil)
		return
	}

	common.WriteJSON(w, http.StatusCreated, map[string]any{"cartItem": cartsTypes.ConvertCartItemToResponse(resp.CartItem)})
}

func (h *handler) HandleChangeCartItemQuantity(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "HandleChangeCartItemQuantity Gateway")
	defer span.End()

	cartItemId, err := GetPathValueAsInt(r, "id")
	if err != nil {
		errStr := fmt.Sprintf("invalid cartItemId id received: '%v'", cartItemId)
		shared.HandleSpanErr(&span, errors.New(errStr))
		common.WriteError(w, http.StatusBadRequest, errStr)
		return
	}
	span.SetAttributes(attribute.Int("cartItem.id", cartItemId))

	var body cartsTypes.ChangeCartItemQuantityBody
	err = common.ReadJSON(r, &body)
	if err != nil {
		shared.HandleSpanErr(&span, err)
		common.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	var req = &pb.ChangeCartItemQuantityRequest{
		CartItemId: int32(cartItemId),
		Operation: pb.Sign(pb.Sign_value[body.Operation]),
	}
	span.SetAttributes(attribute.Stringer("payload", req))
	
	_, err = h.cartsGateway.ChangeCartItemQuantity(ctx, req)
	rStatus := status.Convert(err)
	if rStatus != nil {
		shared.HandleSpanErr(&span, err)
		common.HandleGrpcErr(err, rStatus, w, nil)
		return
	}
	common.WriteJSON(w, http.StatusAccepted, map[string]any{})
}

func (h *handler) HandleRemoveFromCart(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "HandleRemoveFromCart Gateway")
	defer span.End()

	cartItemId, err := GetPathValueAsInt(r, "id")
	if err != nil {
		errStr := fmt.Sprintf("invalid cart item id received: '%v'", cartItemId)
		shared.HandleSpanErr(&span, errors.New(errStr))
		common.WriteError(w, http.StatusBadRequest, errStr)
		return
	}
	span.SetAttributes(attribute.Int("cartItem.id", cartItemId))
	
	_, err = h.cartsGateway.RemoveFromCart(ctx, &pb.RemoveFromCartRequest{CartItemId: int32(cartItemId)})
	rStatus := status.Convert(err)
	if rStatus != nil {
		shared.HandleSpanErr(&span, err)
		common.HandleGrpcErr(err, rStatus, w, nil)
		return
	}

	common.WriteJSON(w, http.StatusNoContent, map[string]any{})
}

func (h *handler) HandleClearCart(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "HandleClearCart Gateway")
	defer span.End()

	_, err := h.cartsGateway.ClearCart(ctx, &pb.ClearCartRequest{})
	rStatus := status.Convert(err)
	if rStatus != nil {
		shared.HandleSpanErr(&span, err)
		common.HandleGrpcErr(err, rStatus, w, nil)
		return
	}

	common.WriteJSON(w, http.StatusNoContent, map[string]any{})
}