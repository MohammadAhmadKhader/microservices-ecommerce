package products

import (
	pb "ms/common/generated"
	"time"
)

type ProductResponse struct {
	pb.Product
	UpdatedAt time.Time `json:"updatedAt"`
	CreatedAt time.Time `json:"createdAt"`
}

func ConvertProductToResponse(product pb.Product) ProductResponse {
	return ProductResponse{
		Product:   product,
		UpdatedAt: product.UpdatedAt.AsTime(),
		CreatedAt: product.CreatedAt.AsTime(),
	}
}
