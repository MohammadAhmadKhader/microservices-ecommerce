package shared

import "ms/common"

var (
	ServiceName   = "gateway"
	MetricsPort   = common.EnvString("METRICS_PORT", "")
	ServiceHost   = common.EnvString("SERVICE_HOST", "127.0.0.3")
	ServicePort   = common.EnvString("SERVICE_PORT", "8080")
	ServiceAddr   = ServiceHost + ":" + ServicePort
	TelemetryHost = common.EnvString("TELEMETRY_HOST", "localhost")
	TelemetryPort = common.EnvString("TELEMETRY_PORT", "4318")
	TelemetryAddr = TelemetryHost + ":" + TelemetryPort
	ConsulHost    = common.EnvString("CONSUL_HOST", "localhost")
	ConsulPort    = common.EnvString("CONSUL_PORT", "8500")
	ConsulAddr    = ConsulHost + ":" + ConsulPort
)