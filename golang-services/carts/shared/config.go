package shared

import (
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
	IS_PRODUCTION bool
	IS_STAGING bool
	IS_DEVELOPMENT bool
}

func LoadEnvs() error {
	err := godotenv.Load("./.env")
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

	isDevelopment := false
	isProduction := false
	isStaging := false
	env := getEnv("ENV","development")
	if env == "development" {
		isDevelopment = true
	} else if env == "staging" {
		isStaging = true
	} else {
		isProduction = true
	}

	return DBConfig{
		DB_HOST: getEnv("DB_HOST",""),
		DB_NAME: getEnv("DB_NAME",""),
		DB_PASSWORD: getEnv("DB_PASSWORD",""),
		DB_USER: getEnv("DB_USER",""),
		DB_PORT: getEnv("DB_PORT",""),
		IS_PRODUCTION: isProduction,
		IS_STAGING: isStaging,
		IS_DEVELOPMENT: isDevelopment,
	}
}

func getEnv(key, fallbackValue string) string {
	if envs[key] != "" {
		return envs[key]
	}

	return fallbackValue
}