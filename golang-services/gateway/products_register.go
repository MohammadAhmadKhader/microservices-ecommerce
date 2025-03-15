package main

import (
	"errors"
	"fmt"

	"ms/common"
	pb "ms/common/generated"
	productsTypes "ms/gateway/types/products"
	"ms/orders/utils"
	"net/http"

	"go.opentelemetry.io/otel/attribute"
)

func (h *handler) productsRegister(mux *http.ServeMux) {
	mux.HandleFunc("GET /api/test", h.Test)
	mux.HandleFunc("GET /api/products", h.HandleGettingAllProducts)
	mux.HandleFunc("GET /api/products/{id}", h.HandleGettingProductById)
	mux.HandleFunc("POST /api/products", h.HandleCreateProduct)
	mux.HandleFunc("PUT /api/products/{id}", h.HandleUpdateProduct)
	mux.HandleFunc("DELETE /api/products/{id}", h.HandleDeleteOneProduct)
}

func (h *handler) Test(w http.ResponseWriter, r *http.Request) {
	common.WriteJSON(w, http.StatusOK, map[string]any{"message":"test success"})
}

func (h *handler) HandleGettingAllProducts(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "HandleGettingAllProducts Gateway")
	defer span.End()
	
	page, limit, err := common.GetPagination(r)
	if err != nil {
		HandleSpanErr(&span, err)
		common.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	findAllResp, err := h.productsGateway.Find(ctx, &pb.FindAll{
		Page:  page,
		Limit: limit,
	})
	
	if err != nil {
		HandleSpanErr(&span, err)
		common.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	var productsResp = make([]productsTypes.ProductResponse, 0)
	for _, prod := range findAllResp.Products {
		productsResp = append(productsResp, productsTypes.ConvertProductToResponse(prod))
	}

	common.WriteJSON(w, http.StatusOK, map[string]any{
		"page":     findAllResp.Page,
		"limit":    findAllResp.Limit,
		"count":    findAllResp.Count,
		"products": productsResp,
	})
}

func (h *handler) HandleGettingProductById(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "HandleGettingProductById Gateway")
	defer span.End()

	productId, err := GetPathValueAsInt(r, "id")
	if err != nil {
		err := fmt.Sprintf("invalid product id received: '%v'", productId)
		common.WriteError(w, http.StatusBadRequest, err)
		return
	}
	span.SetAttributes(attribute.Int("product.id", productId))

	product, err := h.productsGateway.FindOne(ctx, &pb.Id{
		Id: int32(productId),
	})

	if err != nil {
		common.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	common.WriteJSON(w, http.StatusOK, map[string]any{"product": productsTypes.ConvertProductToResponse(product)})
}

func (h *handler) HandleCreateProduct(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "HandleCreateProduct Gateway")
	defer span.End()

	var createPayload pb.CreateProduct
	err := common.ReadJSON(r, &createPayload)
	if err != nil {
		HandleSpanErr(&span, err)
		common.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}
	span.SetAttributes(attribute.Stringer("payload", &createPayload))
	
	product, err := h.productsGateway.Create(ctx, &createPayload)
	if err != nil {
		HandleSpanErr(&span, err)
		common.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	common.WriteJSON(w, http.StatusCreated, map[string]any{"product": productsTypes.ConvertProductToResponse(product)})
}

func (h *handler) HandleUpdateProduct(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "HandleUpdateProduct Gateway")
	defer span.End()

	productId, err := GetPathValueAsInt(r, "id")
	if err != nil {
		errStr := fmt.Sprintf("invalid product id received: '%v'", productId)
		utils.HandleSpanErr(&span, errors.New(errStr))
		common.WriteError(w, http.StatusBadRequest, errStr)
		return
	}
	span.SetAttributes(attribute.Int("product.id", productId))

	var updateProduct pb.UpdateProduct
	err = common.ReadJSON(r, &updateProduct)
	if err != nil {
		utils.HandleSpanErr(&span, err)
		common.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	var payload = &pb.UpdateProduct{
		Id: int32(productId), 
		Name: updateProduct.Name,
		Description: updateProduct.Description,
		Quantity: updateProduct.Quantity,
		CategoryId: updateProduct.CategoryId,
		Price: updateProduct.Price,
	}
	span.SetAttributes(attribute.Stringer("payload", payload))
	
	product, err := h.productsGateway.Update(ctx, payload)
	if err != nil {
		utils.HandleSpanErr(&span, err)
		common.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	common.WriteJSON(w, http.StatusAccepted, map[string]any{"product": productsTypes.ConvertProductToResponse(product)})
}

func (h *handler) HandleDeleteOneProduct(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "HandleDeleteOneProduct Gateway")
	defer span.End()

	productId, err := GetPathValueAsInt(r, "id")
	if err != nil {
		errStr := fmt.Sprintf("invalid product id received: '%v'", productId)
		utils.HandleSpanErr(&span, errors.New(errStr))
		common.WriteError(w, http.StatusBadRequest, errStr)
		return
	}
	span.SetAttributes(attribute.Int("product.id", productId))
	
	_, err = h.productsGateway.DeleteOne(ctx, &pb.Id{Id: int32(productId)})
	if err != nil {
		common.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	common.WriteJSON(w, http.StatusNoContent, map[string]any{})
}