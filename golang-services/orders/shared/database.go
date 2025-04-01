package shared

import (
	"fmt"
	"ms/orders/models"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func formatDSN(user, pass, host, port, dbname string) string {
	return fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local", user, pass, host, port, dbname)
}

func GetMysqlDSN() string {
	return formatDSN(Envs.DB_USER, Envs.DB_PASSWORD, Envs.DB_HOST, Envs.DB_PORT, Envs.DB_NAME)
}

func GetMysqlDSNWithoutDBName() string {
	return formatDSN(Envs.DB_USER, Envs.DB_PASSWORD, Envs.DB_HOST, Envs.DB_PORT, "")
}

func Migrate(db *gorm.DB) error {
	return db.AutoMigrate(&models.Order{}, &models.OrderItem{})
}

func CreateDBIfNotExist() error {
	dbName := Envs.DB_NAME
	if dbName == "" {
		return fmt.Errorf("DB_NAME environment variables is required")
	}
	
	dsnWithoutDBName := GetMysqlDSNWithoutDBName()
	db, err := gorm.Open(mysql.Open(dsnWithoutDBName))
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