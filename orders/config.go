package main

import (
	"fmt"

	"github.com/joho/godotenv"
)

var Envs DBConfig = initConfig()
var envs map[string]string

type DBConfig struct {
	DB_HOST string
	DB_NAME string
	DB_PASSWORD string
	DB_USER string
	DB_PORT string
}

func LoadEnvs() error {
	err := godotenv.Load(".env")
	if err != nil {
		return err
	}
	envVars, err := godotenv.Read()
	if err != nil {
		return err
	}

	envs = envVars
	return nil
}

func initConfig() DBConfig {
	if err := LoadEnvs(); err != nil {
		panic(err)
	}

	return DBConfig{
		DB_HOST: getEnv("DB_HOST",""),
		DB_NAME: getEnv("DB_NAME",""),
		DB_PASSWORD: getEnv("DB_PASSWORD",""),
		DB_USER: getEnv("DB_USER",""),
		DB_PORT: getEnv("DB_PORT",""),
	}
}

func getEnv(key, fallbackValue string) string {
	if envs[key] != "" {
		return envs[key]
	}

	return fallbackValue
}

func formatDSN(user, pass, host, port, dbname string) string {
	return fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local", user, pass, host, port, dbname)
}

func GetMysqlDSN() string {
	return formatDSN(Envs.DB_USER, Envs.DB_PASSWORD,Envs.DB_HOST, Envs.DB_PORT, Envs.DB_NAME)
}
