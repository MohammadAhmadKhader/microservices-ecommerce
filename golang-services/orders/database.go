package main

import (
	"fmt"
	"ms/common"
	"ms/orders/models"

	"github.com/rs/zerolog"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"gorm.io/plugin/opentelemetry/tracing"
)

func InitDB(serviceLogger *zerolog.Logger) *gorm.DB {
	dsn := GetMysqlDSN()
	logger := common.NewCustomGormLogger(serviceLogger, logger.Config{
		LogLevel: logger.Info,
		ParameterizedQueries: true,
	})
	
	err := CreateDBIfNotExist()
	if err != nil {
		panic(err)
	}

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger,
	})

	if err != nil {
		panic(err)
	}

	err = db.Use(tracing.NewPlugin())
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

func CreateDBIfNotExist() error {
	dbName := Envs.DB_NAME
	if dbName == "" {
		return fmt.Errorf("DB_NAME environment variables is required")
	}
	
	dsnWithoutDBName := GetMysqlDSNWithoutDBName()
	db, err :=gorm.Open(mysql.Open(dsnWithoutDBName))
	if err != nil {
		return err
	}

	query := fmt.Sprintf("CREATE DATABASE IF NOT EXISTS %v", dbName)
	err = db.Exec(query).Error
	if err != nil {
		return err
	}

	sqlDB, err := db.DB()
	if err != nil {
		return err
	}

	err = sqlDB.Close()
	if err != nil {
		return err
	}

	return nil
}