package shared

import (
	"ms/common"

	"github.com/rs/zerolog"
)

var SvcLog *zerolog.Logger

func InitLogger() *zerolog.Logger {
	logger := common.NewServiceLogger(LogstashAddr, ServiceName)
	SvcLog = logger
	
	return logger
}
