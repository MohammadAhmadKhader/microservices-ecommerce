package shared

import "ms/common"

var (
	ServiceName   = "carts"
	ServiceHost   = common.EnvString("SERVICE_HOST", "127.0.0.9")
	MetricsPort   = common.EnvString("METRICS_PORT", "127.0.0.9")
	ServicePort   = common.EnvString("SERVICE_PORT", "3001")
	ServiceAddr   = ServiceHost + ":" + ServicePort
	TelemetryHost = common.EnvString("TELEMETRY_HOST", "localhost")
	TelemetryPort = common.EnvString("TELEMETRY_PORT", "4318")
	TelemetryAddr = TelemetryHost + ":" + TelemetryPort
	LogstashHost  = common.EnvString("LOGSTASH_HOST", "localhost")
	LogstashPort  = common.EnvString("LOGSTASH_PORT", "5000")
	LogstashAddr  = LogstashHost + ":" + LogstashPort
)