package common

import (
	"io"
	"log"
	"net"
	"os"

	"github.com/rs/zerolog"
)

func NewLogstashWriter(logstashAddr string) net.Conn {
	conn, err := net.Dial("tcp", logstashAddr)
	if err != nil {
		log.Fatal(err)
	}

	return conn
}

func NewServiceLogger(logstashAddr, serviceName string) *zerolog.Logger {
	logstashWriter := NewLogstashWriter(logstashAddr).(io.Writer)

	writers := zerolog.MultiLevelWriter(os.Stdout, logstashWriter)
	logger := zerolog.New(writers).With().Str("service", serviceName).Logger().With().Timestamp().Logger()

	return &logger
}