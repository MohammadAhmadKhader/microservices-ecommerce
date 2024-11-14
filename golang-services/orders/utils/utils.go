package utils

import (
	"fmt"
	"ms/common"
	pb "ms/common/generated"
	"slices"
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

func ValidateOrder(pb *pb.CreateOrderRequest) error {
	if len(pb.Items) == 0 {
		return common.ErrNoItems
	}

	return nil
}

func CollectProductsIds(pb *pb.CreateOrderRequest) []int {
	var productsIds []int
	for _, item := range pb.Items {
		productsIds = append(productsIds, int(item.ID))
	}

	return productsIds
}
