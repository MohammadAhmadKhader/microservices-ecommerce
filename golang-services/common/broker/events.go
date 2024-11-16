package broker

type RoutingKey string

const (
	RK_OrderCreated RoutingKey = "order.created"
	RK_OrderStatusUpdated RoutingKey = "order.status.update"
	RK_OrderCompleted RoutingKey = "order.completed"
	RK_ProductStockReservedFailed RoutingKey = "product.reserve_stock.failed"
	RK_ProductStockReservedSuccess RoutingKey = "product.reserve_stock.success"
	RK_ProductDeleted RoutingKey = "product.deleted"
)

type Queue string 

const (
	OrdersQueue Queue = "orders_queue"
	ProductsQueue Queue = "products_queue"
	ProductsDLQ Queue = "products_dlq"
	MainQueue Queue = "main_queue"
	MainDLQ Queue = "main_dlq"
)

type Exchange string

const (
	OrdersExchange Exchange = "orders_exchange"
	ProductsExchange Exchange = "products_exchange"
	ProductsDLX Exchange = "products_dlx"
)