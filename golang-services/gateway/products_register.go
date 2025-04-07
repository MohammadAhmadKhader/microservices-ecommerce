package main

import (
	"errors"
	"fmt"

	"ms/common"
	pb "ms/common/generated"
	"ms/gateway/middlewares"
	"ms/gateway/shared"
	productsTypes "ms/gateway/types/products"
	"net/http"

	"go.opentelemetry.io/otel/attribute"
	"google.golang.org/grpc/status"
)

func (h *handler) productsRegister(mux *http.ServeMux) {
	Authenticate := middlewares.Authenticate

	mux.HandleFunc("GET /api/products",h.HandleGettingAllProducts)
	mux.HandleFunc("GET /api/products/{id}", h.HandleGettingProductById)
	mux.HandleFunc("POST /api/products", Authenticate(h.authGateway, tracer, pb.PermissionType_DASHBOARD_PRODUCT_CREATE)(h.HandleCreateProduct))
	mux.HandleFunc("PUT /api/products/{id}", Authenticate(h.authGateway, tracer, pb.PermissionType_DASHBOARD_PRODUCT_UPDATE)(h.HandleUpdateProduct))
	mux.HandleFunc("DELETE /api/products/{id}",  Authenticate(h.authGateway, tracer, pb.PermissionType_DASHBOARD_PRODUCT_DELETE)(h.HandleDeleteOneProduct))
}

func (h *handler) HandleGettingAllProducts(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "HandleGettingAllProducts Gateway")
	defer span.End()
	
	page, limit, err := common.GetPagination(r)
	if err != nil {
		shared.HandleSpanErr(&span, err)
		common.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	findAllResp, err := h.productsGateway.Find(ctx, &pb.FindAllProductsRequest{
		Page:  page,
		Limit: limit,
	})
	
	rStatus := status.Convert(err)
	if rStatus != nil {
		shared.HandleSpanErr(&span, err)
		common.HandleGrpcErr(err, rStatus, w, nil)
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

	resp, err := h.productsGateway.FindOne(ctx, &pb.FindOneProductRequest{
		Id: int32(productId),
	})

	if err != nil {
		common.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	common.WriteJSON(w, http.StatusOK, map[string]any{"product": productsTypes.ConvertProductToResponse(resp.Product)})
}

func (h *handler) HandleCreateProduct(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "HandleCreateProduct Gateway")
	defer span.End()

	var createPayload pb.CreateProductRequest
	err := common.ReadJSON(r, &createPayload)
	if err != nil {
		shared.HandleSpanErr(&span, err)
		common.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}
	span.SetAttributes(attribute.Stringer("payload", &createPayload))
	
	resp, err := h.productsGateway.Create(ctx, &createPayload)
	rStatus := status.Convert(err)
	if rStatus != nil {
		shared.HandleSpanErr(&span, err)
		common.HandleGrpcErr(err, rStatus, w, nil)
		return
	}

	common.WriteJSON(w, http.StatusCreated, map[string]any{"product": productsTypes.ConvertProductToResponse(resp.Product)})
}

func (h *handler) HandleUpdateProduct(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "HandleUpdateProduct Gateway")
	defer span.End()

	productId, err := GetPathValueAsInt(r, "id")
	if err != nil {
		errStr := fmt.Sprintf("invalid product id received: '%v'", productId)
		shared.HandleSpanErr(&span, errors.New(errStr))
		common.WriteError(w, http.StatusBadRequest, errStr)
		return
	}
	span.SetAttributes(attribute.Int("product.id", productId))

	var updateProduct pb.UpdateProductRequest
	err = common.ReadJSON(r, &updateProduct)
	if err != nil {
		shared.HandleSpanErr(&span, err)
		common.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	var payload = &pb.UpdateProductRequest{
		Id: int32(productId), 
		Name: updateProduct.Name,
		Description: updateProduct.Description,
		Quantity: updateProduct.Quantity,
		CategoryId: updateProduct.CategoryId,
		Price: updateProduct.Price,
	}
	span.SetAttributes(attribute.Stringer("payload", payload))
	
	resp, err := h.productsGateway.Update(ctx, payload)
	rStatus := status.Convert(err)
	if rStatus != nil {
		shared.HandleSpanErr(&span, err)
		common.HandleGrpcErr(err, rStatus, w, nil)
		return
	}

	common.WriteJSON(w, http.StatusAccepted, map[string]any{"product": productsTypes.ConvertProductToResponse(resp.Product)})
}

func (h *handler) HandleDeleteOneProduct(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "HandleDeleteOneProduct Gateway")
	defer span.End()

	productId, err := GetPathValueAsInt(r, "id")
	if err != nil {
		errStr := fmt.Sprintf("invalid product id received: '%v'", productId)
		shared.HandleSpanErr(&span, errors.New(errStr))
		common.WriteError(w, http.StatusBadRequest, errStr)
		return
	}
	span.SetAttributes(attribute.Int("product.id", productId))
	
	_, err = h.productsGateway.DeleteOne(ctx, &pb.DeleteOneProductRequest{Id: int32(productId)})
	rStatus := status.Convert(err)
	if rStatus != nil {
		shared.HandleSpanErr(&span, err)
		common.HandleGrpcErr(err, rStatus, w, nil)
		return
	}

	common.WriteJSON(w, http.StatusNoContent, map[string]any{})
}