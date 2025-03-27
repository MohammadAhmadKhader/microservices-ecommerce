package common

import (
	"context"
	"time"

	"github.com/rs/zerolog"
	"gorm.io/gorm/logger"
)

// Must be changed to add the ability to put the gorm config
type CustomGormLogger struct {
	servLogger  *zerolog.Logger
	logger.Config
}

func (g *CustomGormLogger) LogMode(level logger.LogLevel) logger.Interface {
	newLogger := *g
	newLogger.LogLevel = level
	return &newLogger
}

func (g *CustomGormLogger) Info(ctx context.Context, msg string, args ...any) {
	g.servLogger.Info().Msgf(msg, args...)
}

func (g *CustomGormLogger) Warn(ctx context.Context, msg string, args ...any) {
	g.servLogger.Warn().Msgf(msg, args...)
}

func (g *CustomGormLogger) Error(ctx context.Context, msg string, args ...any) {
	g.servLogger.Error().Msgf(msg, args...)
}

// no passwords in golang services so far to sanitize

func (g *CustomGormLogger) Trace(ctx context.Context, begin time.Time, f func() (sql string, rowsAffected int64), err error) {
	duration := time.Since(begin)

	sql, rows := f()

	if err != nil {
		g.servLogger.Error().Err(err).
		Str("query", sql).Int64("rows_affected", rows).Dur("durationMs", duration).
		Msg("failed to execute query")
	} else {
		g.servLogger.Info().
		Str("query", sql).Int64("rows_affected", rows).Dur("durationMs", duration).
		Msg("executed query successfully")
	}
}

func (l *CustomGormLogger) ParamsFilter(ctx context.Context, sql string, params ...interface{}) (string, []interface{}) {
	if l.Config.ParameterizedQueries {
		return sql, nil
	}
	
	return sql, params
}


func NewCustomGormLogger(serviceLogger *zerolog.Logger, config logger.Config) *CustomGormLogger {
	return &CustomGormLogger{
		servLogger:  serviceLogger,
		Config: config,
	}
}