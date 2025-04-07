package cli

import (
	"encoding/json"
	"io"
	"ms/carts/models"
	"os"

	"gorm.io/gorm"
)

type JsonData struct {
	CartItems []models.CartItem `json:"carts"`
}

func NewJsonData(cartItems []models.CartItem) JsonData {
	return JsonData{
		CartItems: cartItems,
	}
}

func syncJsonWithDatabase() error {
	var cartItems []models.CartItem
	err := cliDB.Model(&models.Cart{}).Find(&cartItems).Error
	if err != nil {
		cliLogger.Println("error during attempt to fetch carts")
		return err
	}
	
	jsonData := NewJsonData(cartItems)
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
	
	for _, cartItem := range jsonData.CartItems {
		var existingCart models.CartItem
		
		err := cliDB.Model(&models.CartItem{}).First(&existingCart, cartItem.ID).Error
		if err != nil && err != gorm.ErrRecordNotFound  {
			cliLogger.Printf("an error has occurred during attempt to fetch an cart with id '%v', error: %v\n", cartItem.ID, err.Error())
			return err
		}

		if existingCart.ID == 0 {
			err := cliDB.Model(&models.CartItem{}).Create(cartItem).Error
			if err != nil {
				cliLogger.Printf("an error has occurred during attempt to create an cart, payload: %v\n", cartItem)
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