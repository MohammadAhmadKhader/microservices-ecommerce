package cli

import (
	"encoding/json"
	"io"
	"ms/orders/models"
	"os"

	"gorm.io/gorm"
)

type JsonData struct {
	Orders []models.Order `json:"orders"`
	OrdersItems []models.OrderItem `json:"ordersItems"`
}

func NewJsonData(orders []models.Order, ordersItems []models.OrderItem) JsonData {
	return JsonData{
		Orders: orders,
		OrdersItems: ordersItems,
	}
}

func syncJsonWithDatabase() error {
	var orders []models.Order
	err := cliDB.Model(&models.Order{}).Find(&orders).Error
	if err != nil {
		cliLogger.Println("error during attempt to fetch orders")
		return err
	}

	var ordersItems []models.OrderItem
	err = cliDB.Model(&models.OrderItem{}).Find(&ordersItems).Error
	if err != nil {
		cliLogger.Println("error during attempt to fetch orders items")
		return err
	}

	
	jsonData := NewJsonData(orders, ordersItems)
	jsonDataBytes, err := json.MarshalIndent(jsonData, "", "  ")
	if err != nil {
		cliLogger.Println("error during attempt to marshelling jsonData")
		return err
	}

	err = os.WriteFile(dataFilePath, jsonDataBytes, 0644)
	if err != nil {
		cliLogger.Println("error during attempt to marshelling write to json data file")
		return err
	}

	return nil
}

func syncDatabaseWithJson() error {
	jsonData, err := fetchJsonData()
	cliLogger.Println(jsonData,"000")
	if err != nil {
		return err
	}
	
	for _, order := range jsonData.Orders {
		var existingOrder models.Order
		
		err := cliDB.Model(&models.Order{}).First(&existingOrder, order.ID).Error
		if err != nil && err != gorm.ErrRecordNotFound  {
			cliLogger.Printf("an error has occurred during attempt to fetch an order with id '%v', error: %v\n", order.ID, err.Error())
			return err
		}

		if existingOrder.ID == 0 {
			err := cliDB.Model(&models.Order{}).Create(order).Error
			if err != nil {
				cliLogger.Printf("an error has occurred during attempt to create an order, payload: %v\n", order)
				return err
			}
		}
	}

	for _, orderItem := range jsonData.OrdersItems {
		var existingOrderItem models.OrderItem

		err = cliDB.Model(&models.OrderItem{}).First(&existingOrderItem, orderItem.ID).Error
		if err != nil && err != gorm.ErrRecordNotFound  {
			cliLogger.Printf("an error has occurred during attempt to fetch an orderItem with id '%v', error: %v\n", existingOrderItem.ID, err.Error())
			return err
		}

		if existingOrderItem.ID == 0 {
			err := cliDB.Model(&models.OrderItem{}).Create(orderItem).Error
			if err != nil {
				cliLogger.Printf("an error has occurred during attempt to create an orderItem, payload: %v\n", existingOrderItem)
				return err
			}
		}
	}

	return nil
}


func fetchJsonData() (*JsonData, error) {
	file, err := os.Open(dataFilePath)
	if err != nil {
		cliLogger.Printf("error during attempt to open file with path %s\n", dataFilePath)
		return nil, err
	}
	defer file.Close()

	var jsonData JsonData
	data, err := io.ReadAll(file)
	if err != nil {
		cliLogger.Println("error during attempt to read file with path")
		return nil, err
	}

	err = json.Unmarshal(data, &jsonData)
	if err != nil {
		cliLogger.Println("error during attempt to unmarshal data")
		return nil, err
	}

	return &jsonData, nil
}