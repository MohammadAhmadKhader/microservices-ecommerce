package main

import (
	"context"
	"errors"
	"fmt"
	"strconv"

	"ms/common/common-go"
	pb "ms/gateway/generated"
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
	mux.HandleFunc("POST /api/users/{userId}/orders", Authenticate(h.authClient)(h.HandleCreateOrder))
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

	err = validateItems(itemsObj.Items)
	if err != nil {
		common.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	// TODO: this must be changed to be a one function that gets a product from slice of id's with one query later.
	for _, item := range itemsObj.Items {
		_, err := h.productsClient.FindOne(context.Background(), &pb.Id{Id: item.ID})
		rStatus := status.Convert(err)
		if rStatus != nil {
			common.HandleGrpcErr(err, rStatus, w, nil)
			return
		}
	}

	order, err := h.client.CreateOrder(r.Context(), &pb.CreateOrderRequest{
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

func validateItems(items []*pb.Item) error {
	if len(items) == 0 {
		return errors.New("items must have at least one item")
	}

	for _, item := range items {
		if item.ID == 0 {
			return errors.New("item id can not be empty string")
		}

		if item.Quantity <= 0 {
			return errors.New("item quantity can not be less than 0")
		}

		if item.Quantity != int32(item.Quantity) {
			return errors.New("item quantity can not be float")
		}
	}

	return nil
}