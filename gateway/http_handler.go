package main

import (
	"net/http"

	pb "ms/gateway/generated"
)

type handler struct {
	client         pb.OrderServiceClient

	// will be removed and services instances will be used from service discovery
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
	h.productsRegister(mux)
	h.authRegister(mux)
	h.ordersRegister(mux)
}