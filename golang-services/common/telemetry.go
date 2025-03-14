package common

import (
	"context"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/sdk/resource"
	"go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.4.0"
	"google.golang.org/grpc/metadata"
)

func InitTracer(ctx context.Context, endpoint string, serviceName string) (*trace.TracerProvider, error) {
	client := otlptracehttp.NewClient(
		otlptracehttp.WithInsecure(),
		otlptracehttp.WithEndpoint(endpoint))

	exporter, err := otlptrace.New(ctx, client)
	if err != nil {
		return nil, err
	}

	provider := trace.NewTracerProvider(
		trace.WithBatcher(exporter),
		trace.WithSpanProcessor(trace.NewBatchSpanProcessor(exporter)),
		trace.WithResource(resource.NewWithAttributes(
			semconv.SchemaURL,
			semconv.DBSystemMySQL,
			semconv.TelemetrySDKLanguageGo,
			semconv.TelemetrySDKNameKey.String("open-telemetry"),
			semconv.MessagingProtocolKey.String("AMQP"),
			semconv.ServiceNameKey.String(serviceName),
		)),

	)

	otel.SetTracerProvider(provider)
	
	otel.SetTextMapPropagator(propagation.NewCompositeTextMapPropagator(propagation.TraceContext{}, propagation.Baggage{}))
	//otel.SetTextMapPropagator(propagation.TraceContext{})

	return provider, nil
}

func SendGrpcContext(ctx context.Context) (context.Context, HeadersCarrier) {
	carries := make(HeadersCarrier)
	otel.GetTextMapPropagator().Inject(ctx, carries)

	return metadata.NewOutgoingContext(ctx, metadata.New(carries)), carries
}