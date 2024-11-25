package common

import (
	"context"
	"os"
	"time"

	"github.com/rs/zerolog"
	"gorm.io/gorm/logger"
)

type CustomGormLogger struct {
	zerolog  zerolog.Logger
	LogLevel logger.LogLevel
}

func (g *CustomGormLogger) LogMode(level logger.LogLevel) logger.Interface {
	newLogger := *g
	newLogger.LogLevel = level
	return &newLogger
}

func (g *CustomGormLogger) Info(ctx context.Context, msg string, data ...any) {
	g.zerolog.Info().Msgf(msg, data...)
}

func (g *CustomGormLogger) Warn(ctx context.Context, msg string, data ...any) {
	g.zerolog.Warn().Msgf(msg, data...)
}

func (g *CustomGormLogger) Error(ctx context.Context, msg string, data ...any) {
	g.zerolog.Error().Msgf(msg, data...)
}

// no passwords in golang services so far to sanitize

func (g *CustomGormLogger) Trace(ctx context.Context, begin time.Time, f func() (sql string, rowsAffected int64), err error) {
	duration := time.Since(begin)

	sql, rows := f()

	if err != nil {
		g.zerolog.Error().Str("query", sql).Int64("rows", rows).
			Dur("duration", duration).Err(err).Msg("Query execution failed")

	} else {
		g.zerolog.Info().Str("query", sql).Int64("rows", rows).
			Dur("duration", duration).Msg("")
	}
}

func NewCustomGormLogger() *CustomGormLogger {
	zerolog := zerolog.New(os.Stdout)

	return &CustomGormLogger{
		zerolog:  zerolog,
		LogLevel: logger.Info,
	}
}
