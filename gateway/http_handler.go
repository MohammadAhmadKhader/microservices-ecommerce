package main

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"ms/common/common-go"
	"ms/gateway/cookie"
	pb "ms/gateway/generated"
	"ms/gateway/middlewares"
	productsTypes "ms/gateway/types/products"

	"google.golang.org/grpc/status"
)

type handler struct {
	client         pb.OrderServiceClient
	productsClient pb.ProductsServiceClient
	authClient     pb.AuthServiceClient
	sessionsClient pb.SessionsServiceClient
}

func NewHandler(client pb.OrderServiceClient, productsClient pb.ProductsServiceClient,
	authClient pb.AuthServiceClient, sessionsClient pb.SessionsServiceClient) *handler {
	return &handler{
		client:         client,
		productsClient: productsClient,
		authClient:     authClient,
		sessionsClient: sessionsClient,
	}
}

func (h *handler) registerRoutes(mux *http.ServeMux) {
	Authenticate := middlewares.Authenticate
	// order
	mux.HandleFunc("POST /api/users/{userId}/orders", Authenticate(h.authClient)(h.HandleCreateOrder))

	// product
	mux.HandleFunc("GET /api/products", h.HandleGettingAllProducts)
	mux.HandleFunc("GET /api/products/{productId}", h.HandleGettingProductById)
	mux.HandleFunc("POST /api/products", h.HandleCreateProduct)
	mux.HandleFunc("PUT /api/products/{productId}", h.HandleUpdateProduct)
	mux.HandleFunc("DELETE /api/products", h.HandleDeleteProduct)

	// auth
	mux.HandleFunc("POST /api/auth/login", h.HandleLogin)
	mux.HandleFunc("POST /api/auth/regist", h.HandleRegist)

}

type CreateOrderPayload struct {
	Items []*pb.Item `json:"items"`
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

func (h *handler) HandleGettingProductById(w http.ResponseWriter, r *http.Request) {
	productIdAsStr := r.PathValue("productId")
	fmt.Println(productIdAsStr, "gateway -- HandleGettingProductById")
	productId, err := strconv.Atoi(productIdAsStr)
	if err != nil {
		err := fmt.Sprintf("invalid product id received: '%v'", productIdAsStr)
		common.WriteError(w, http.StatusBadRequest, err)
		return
	}
	// this send the items to grpc
	product, err := h.productsClient.FindOne(r.Context(), &pb.Id{
		Id: int32(productId),
	})

	if err != nil {
		common.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}
	fmt.Println(product.CreatedAt.AsTime().Format(time.RFC3339))

	common.WriteJSON(w, http.StatusOK, map[string]any{"product": productsTypes.ConvertProductToResponse(*product)})
}

func (h *handler) HandleGettingAllProducts(w http.ResponseWriter, r *http.Request) {
	page, limit, err := common.GetPagination(r)
	if err != nil {
		common.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	findAllResp, err := h.productsClient.Find(r.Context(), &pb.FindAll{
		Page:  page,
		Limit: limit,
	})
	
	if err != nil {
		common.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	common.WriteJSON(w, http.StatusOK, map[string]any{
		"page":     findAllResp.Page,
		"limit":    findAllResp.Limit,
		"count":    findAllResp.Count,
		"products": findAllResp.Products,
	})
}

func (h *handler) HandleCreateProduct(w http.ResponseWriter, r *http.Request) {
	var createPayload pb.CreateProduct
	err := common.ReadJSON(r, &createPayload)
	if err != nil {
		common.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}
	
	product, err := h.productsClient.Create(r.Context(), &createPayload)
	if err != nil {
		common.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	common.WriteJSON(w, http.StatusCreated, map[string]any{"product": productsTypes.ConvertProductToResponse(*product)})
}

func (h *handler) HandleUpdateProduct(w http.ResponseWriter, r *http.Request) {
	var updateProduct pb.UpdateProduct
	err := common.ReadJSON(r, &updateProduct)
	if err != nil {
		common.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}
	// this send the items to grpc
	product, err := h.productsClient.Update(r.Context(), &updateProduct)
	if err != nil {
		common.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	common.WriteJSON(w, http.StatusAccepted, map[string]any{"product": product})
}

func (h *handler) HandleDeleteProduct(w http.ResponseWriter, r *http.Request) {
	productIdAsStr := r.PathValue("productId")
	productId, err := strconv.Atoi(productIdAsStr)
	if err != nil {
		err := fmt.Sprintf("invalid product id received: '%v'", productIdAsStr)
		common.WriteError(w, http.StatusBadRequest, err)
		return
	}
	// this send the items to grpc
	_, err = h.productsClient.DeleteOne(r.Context(), &pb.Id{Id: int32(productId)})
	if err != nil {
		common.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	common.WriteJSON(w, http.StatusNoContent, map[string]any{})
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

func (h *handler) HandleLogin(w http.ResponseWriter, r *http.Request) {
	var loginPayload pb.LoginRequest
	err := common.ReadJSON(r, &loginPayload)
	if err != nil {
		common.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	loginResponse, err := h.authClient.Login(context.Background(),
		&pb.LoginRequest{Email: loginPayload.Email, Password: loginPayload.Password})
	if err != nil {
		common.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	_, err = cookie.SetCookie(w, r, loginResponse.SessionId)
	if err != nil {
		common.WriteError(w, http.StatusInternalServerError, err.Error())
		return
	}

	common.WriteJSON(w, http.StatusOK, map[string]any{"user": loginResponse.User})
}

func (h *handler) HandleRegist(w http.ResponseWriter, r *http.Request) {
	var registPayload pb.RegistRequest
	err := common.ReadJSON(r, &registPayload)
	if err != nil {
		common.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	loginResponse, err := h.authClient.Regist(context.Background(),
		&pb.RegistRequest{
			FirstName: registPayload.FirstName, LastName: registPayload.LastName,
			Email: registPayload.Email, Password: registPayload.Password,
		})
	if err != nil {
		common.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	cookie.SetCookie(w, r, loginResponse.SessionId)

	common.WriteJSON(w, http.StatusOK, map[string]any{"user": loginResponse.User})
}
