package main

import (
	"ms/common"
	"ms/carts/shared"

	"github.com/rs/zerolog"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"gorm.io/plugin/opentelemetry/tracing"
)

func InitDB(serviceLogger *zerolog.Logger) *gorm.DB {
	dsn := shared.GetPostgresDSN()
	logger := common.NewCustomGormLogger(serviceLogger, logger.Config{
		LogLevel: logger.Info,
		ParameterizedQueries: true,
	})
	
	err := shared.CreateDBIfNotExist()
	if err != nil {
		panic(err)
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger,
	})

	if err != nil {
		panic(err)
	}

	err = db.Use(tracing.NewPlugin())
	if err != nil {
		panic(err)
	}

	err = shared.Migrate(db)
	if err != nil {
		panic(err)
	}
	
	return db
}