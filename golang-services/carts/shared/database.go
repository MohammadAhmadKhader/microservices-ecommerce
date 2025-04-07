package shared

import (
	"fmt"
	"ms/carts/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func formatDSN(user, pass, host, port, dbname string) string {
	return fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable", host, user, pass, dbname, port)
}

func formatDSNWithoutDB(user, pass, host, port string) string {
	return fmt.Sprintf("host=%s user=%s password=%s port=%s sslmode=disable", host, user, pass, port)
}

func GetPostgresDSN() string {
	return formatDSN(Envs.DB_USER, Envs.DB_PASSWORD, Envs.DB_HOST, Envs.DB_PORT, Envs.DB_NAME)
}

func GetPostgresDSNWithoutDBName() string {
	return formatDSNWithoutDB(Envs.DB_USER, Envs.DB_PASSWORD, Envs.DB_HOST, Envs.DB_PORT)
}

func Migrate(db *gorm.DB) error {
	return db.AutoMigrate(&models.CartItem{})
}

func CreateDBIfNotExist() error {
	dbName := Envs.DB_NAME
	if dbName == "" {
		return fmt.Errorf("DB_NAME environment variables is required")
	}
	
	dsnWithoutDBName := GetPostgresDSNWithoutDBName()
	db, err := gorm.Open(postgres.Open(dsnWithoutDBName))
	if err != nil {
		return err
	}

	var count int64
	query := fmt.Sprintf("SELECT Count(1) FROM pg_database WHERE datname = '%v';", dbName)
	err = db.Raw(query).Count(&count).Error
	if err != nil {
		return err
	}

	if count == 0 {
		query := fmt.Sprintf("CREATE DATABASE %v", dbName)
		err = db.Exec(query).Error
		if err != nil {
			return err
		}
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