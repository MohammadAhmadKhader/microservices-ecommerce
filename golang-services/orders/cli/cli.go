package cli

import (
	"log"
	"os"

	"ms/orders/shared"

	"github.com/spf13/cobra"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var (
	cliDB *gorm.DB
	dataStagingFilePath = "./cli/data.staging.json"
	dataDevFilePath = "./cli/data.dev.json"
	dataFilePath = ""
	cliLogger *log.Logger
	envs shared.DBConfig
)


// flags
var (
	syncJSON    bool
	syncDB 		bool
)

var SeedCommand = &cobra.Command{
	Use:   "seed",
	Run: func(cmd *cobra.Command, args []string) {
		if(syncJSON) {
			cliLogger.Println("starting to sync json with database...")
			err := syncJsonWithDatabase()
			if err != nil {
				cliLogger.Println("syncing json with database was failed with an error", err.Error())
				return
			}

			cliLogger.Println("syncing json with database was completed successfully")
		}

		if(syncDB) {
			cliLogger.Println("starting to sync database with json...")
			err := syncDatabaseWithJson()
			if err != nil {
				cliLogger.Println("syncing database with json was failed with an error", err.Error())
				return
			}

			cliLogger.Println("syncing database with json was completed successfully")
		}

		cliLogger.Println("existing cli")
	},
}

func ExecuteCommands() error {
	cliLogger = log.New(os.Stdout, "[Cli] ", log.LstdFlags|log.Lshortfile)
	Init()
	cliDB = initDB()
	envs = shared.Envs
	if envs.IS_STAGING {
		dataFilePath = dataStagingFilePath
	} else if envs.IS_DEVELOPMENT {
		dataFilePath = dataDevFilePath
	}

	err := SeedCommand.Execute()
	if err != nil {
		return err
	}

	return nil
}

func initDB() (db *gorm.DB) {
	dsn := shared.GetMysqlDSN()
	err := shared.CreateDBIfNotExist()
	if err != nil {
		panic(err)
	}

	db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		panic(err)
	}
	
	err = shared.Migrate(db)
	if err != nil {
		panic(err)
	}
	
	return db
}

func Init() {
	SeedCommand.Flags().BoolVarP(&syncJSON, "sync-json", "j", false, "sync json with the data from the database")
	SeedCommand.Flags().BoolVarP(&syncDB, "sync-db", "d", false, "sync database with the data from the json")
}