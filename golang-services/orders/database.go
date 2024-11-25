package main

import (
	"ms/common"
	"ms/orders/models"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB = initDB()

func initDB() *gorm.DB {
	dsn := GetMysqlDSN()
	logger := common.NewCustomGormLogger()
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger,
	})
	
	if err != nil {
		panic(err)
	}

	err = migrate(db)
	if err != nil {
		panic(err)
	}
	return db
}

func migrate(db *gorm.DB) error {
	return db.AutoMigrate(&models.Order{}, &models.OrderItem{})
}
