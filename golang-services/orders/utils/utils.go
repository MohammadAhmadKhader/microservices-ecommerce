package utils

import (
	"fmt"
	pb "ms/common/generated"
	"slices"

	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/trace"
)

func GetUnmatchedIds(productsIds []int32, prods []*pb.Product) (Ids string) {
	idsStr := ""
	exitingIds := make([]int32, 0, len(prods))
	for _, prod := range prods {
		exitingIds = append(exitingIds, prod.Id)
	}

	for _, prodId := range productsIds {
		if !slices.Contains(exitingIds, prodId) {
			idsStr += fmt.Sprintf("%v, ", prodId)
		}
	}

	if len(idsStr) > 0 {
		idsStr = idsStr[:len(idsStr)-2]
	}

	return idsStr
}

func CollectProductsIds(cartItems []*pb.CartItem) []int32 {
	var productsIds []int32
	for _, cartItem := range cartItems {
		productsIds = append(productsIds, cartItem.GetProductId())
	}

	return productsIds
}

func HandleSpanErr(span *trace.Span, err error) {
	(*span).SetStatus(codes.Error, err.Error())
    (*span).RecordError(err)
}

func MapProdutsIdsToPrice(products []*pb.Product) map[int32]float32 {
	m := make(map[int32]float32)
	for _, prod := range products {
		m[prod.Id] = prod.Price
	}

	return m
}

func ValidateReturnedProducts(products []*pb.Product, cartItems []*pb.CartItem) error {
	for _, cartItem := range cartItems {
		isCartItemFound := false
		for _, prod := range products {
			if prod == nil {
				return fmt.Errorf("one of the products was not found")
			}

			if cartItem.ProductId == prod.Id {
				isCartItemFound = true
				break;
			}
		}

		if !isCartItemFound {
			return fmt.Errorf("missing one of the products with id: '%v'", cartItem.GetProductId())
		}
	}

	return nil
}