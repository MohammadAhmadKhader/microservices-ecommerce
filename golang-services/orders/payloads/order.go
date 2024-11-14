package payloads

type CreateOrder struct {
	UserId int `json:"userId"`
	Items []Item `json:"items"`
}

type UpdateOrderStatus struct {
	Status string `json:"status"`
}

type Item struct {
	Quantity int `json:"quantity"`
	ProductId int `json:"productId"`
}