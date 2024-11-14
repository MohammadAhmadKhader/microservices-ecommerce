package main

import (
	"fmt"
	"strconv"

	"ms/common"
	pb "ms/common/generated"
	"ms/gateway/middlewares"
	"net/http"

	"google.golang.org/grpc/status"
)

type CreateOrderPayload struct {
	Items []*pb.Item `json:"items"`
}

func(h *handler) ordersRegister(mux *http.ServeMux) {
	Authenticate := middlewares.Authenticate
	// order
	mux.HandleFunc("POST /api/users/{userId}/orders", Authenticate(h.authGateway)(h.HandleCreateOrder))
}

func (h *handler) HandleCreateOrder(w http.ResponseWriter, r *http.Request) {
	userIdStr := r.PathValue("userId")

	userId, err := strconv.Atoi(userIdStr)
	if err != nil {
		common.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	var itemsObj CreateOrderPayload
	if err := common.ReadJSON(r, &itemsObj); err != nil {
		fmt.Println("error parsing payload")
		common.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	order, err := h.ordersGateway.CreateOrder(r.Context(), &pb.CreateOrderRequest{
		UserId: int32(userId),
		Items:  itemsObj.Items,
	})

	rStatus := status.Convert(err)
	if rStatus != nil {
		common.HandleGrpcErr(err, rStatus, w, nil)
		return
	}

	common.WriteJSON(w, http.StatusOK, map[string]any{"order": order})
}