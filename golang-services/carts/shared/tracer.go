package shared

import (
	"context"
	"ms/common"

	"go.opentelemetry.io/otel/trace"
	sdkTrace "go.opentelemetry.io/otel/sdk/trace"
)

var Tracer trace.Tracer

func InitTracer(ctx context.Context, opts ...common.TracingOptions) (*sdkTrace.TracerProvider, error) {
	tracerProvider, err := common.InitTracer(ctx, TelemetryAddr, ServiceName, opts...)
	if err != nil {
		return nil, err
	}
	
	serviceTracer := tracerProvider.Tracer(ServiceName)
	Tracer = serviceTracer

	return tracerProvider, nil
}