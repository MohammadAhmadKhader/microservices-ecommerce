package main

import (
	"fmt"

	productsTypes "ms/gateway/types/products"
	"ms/common"
	pb "ms/common/generated"
	"net/http"
	"strconv"
	"time"
)

func (h *handler) productsRegister(mux *http.ServeMux) {
	mux.HandleFunc("GET /api/products", h.HandleGettingAllProducts)
	mux.HandleFunc("GET /api/products/{productId}", h.HandleGettingProductById)
	mux.HandleFunc("POST /api/products", h.HandleCreateProduct)
	mux.HandleFunc("PUT /api/products/{productId}", h.HandleUpdateProduct)
	mux.HandleFunc("DELETE /api/products", h.HandleDeleteOneProduct)
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

	product, err := h.productsGateway.FindOne(r.Context(), &pb.Id{
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

	findAllResp, err := h.productsGateway.Find(r.Context(), &pb.FindAll{
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
	
	product, err := h.productsGateway.Create(r.Context(), &createPayload)
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
	
	product, err := h.productsGateway.Update(r.Context(), &updateProduct)
	if err != nil {
		common.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	common.WriteJSON(w, http.StatusAccepted, map[string]any{"product": product})
}

func (h *handler) HandleDeleteOneProduct(w http.ResponseWriter, r *http.Request) {
	productIdAsStr := r.PathValue("productId")
	productId, err := strconv.Atoi(productIdAsStr)
	if err != nil {
		err := fmt.Sprintf("invalid product id received: '%v'", productIdAsStr)
		common.WriteError(w, http.StatusBadRequest, err)
		return
	}
	
	_, err = h.productsGateway.DeleteOne(r.Context(), &pb.Id{Id: int32(productId)})
	if err != nil {
		common.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	common.WriteJSON(w, http.StatusNoContent, map[string]any{})
}