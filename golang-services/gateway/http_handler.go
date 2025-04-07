package main

import (
	"net/http"

	"ms/gateway/gateway"
)

type handler struct {
	ordersGateway         *gateway.OrdersGateway
	productsGateway *gateway.ProductsGateway
	authGateway     *gateway.AuthGateway
	cartsGateway *gateway.CartsGateway
}

func NewHandler(ordersGateway *gateway.OrdersGateway, productsGateway *gateway.ProductsGateway,
	authGateway *gateway.AuthGateway, cartsGateway *gateway.CartsGateway) *handler {
	return &handler{
		ordersGateway:         ordersGateway,
		productsGateway: productsGateway,
		authGateway:     authGateway,
		cartsGateway: cartsGateway,
	}
}

func (h *handler) registerRoutes(mux *http.ServeMux) {
	h.productsRegister(mux)
	h.authRegister(mux)
	h.ordersRegister(mux)
	h.cartsRegister(mux)
}