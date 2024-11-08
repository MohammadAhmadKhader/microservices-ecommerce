package main

import (
	"ms/orders/models"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB = initDB()

func initDB() *gorm.DB {
	dsn := GetMysqlDSN()
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
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
