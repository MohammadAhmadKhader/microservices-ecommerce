package broker

type EventName string

const (
	OrderCreated = "order.created"
	OrderStatusUpdated = "order.status.update"

	ProductStockReserved = "product.reserve_stock"
	ProductDeleted = "product.deleted"
)