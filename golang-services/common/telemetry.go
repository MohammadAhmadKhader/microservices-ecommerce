package common

import (
	"context"
	"os"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/sdk/resource"
	"go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.4.0"
	"google.golang.org/grpc/metadata"
)

type TracingOptions struct {
	TracerProviderOptions []trace.TracerProviderOption
	ResourceAttributes []attribute.KeyValue
}

func InitTracer(ctx context.Context, endpoint string, serviceName string, opts ...TracingOptions) (*trace.TracerProvider, error) {
	client := otlptracehttp.NewClient(
		otlptracehttp.WithInsecure(),
		otlptracehttp.WithEndpoint(endpoint))

	exporter, err := otlptrace.New(ctx, client)
	if err != nil {
		return nil, err
	}

	samplingRatio := 1.0
	if os.Getenv("env") == "production" {
		samplingRatio = 0.1
	}

	var serviceOptions TracingOptions
	if len(opts) > 0 {
		serviceOptions = opts[0]
	}

	defaultAttrs := []attribute.KeyValue{
		semconv.DBSystemMySQL,
		semconv.TelemetrySDKLanguageGo,
		semconv.TelemetrySDKNameKey.String("open-telemetry"),
		semconv.MessagingProtocolKey.String("AMQP"),
		semconv.ServiceNameKey.String(serviceName),
	}
	allAttrs := append(defaultAttrs, serviceOptions.ResourceAttributes...)

	resourceOpts, err := resource.New(
		ctx,
		resource.WithSchemaURL(semconv.SchemaURL),
		resource.WithAttributes(allAttrs...),
	)
	if err != nil {
		return nil, err
	}

	mergedOptions := TracingOptions{
		TracerProviderOptions: append(
			[]trace.TracerProviderOption{
				trace.WithSampler(trace.ParentBased(trace.TraceIDRatioBased(samplingRatio))),
				trace.WithBatcher(exporter),
				trace.WithSpanProcessor(trace.NewBatchSpanProcessor(exporter)),
				trace.WithResource(resourceOpts),
			},
			serviceOptions.TracerProviderOptions...,
		),
	}

	provider := trace.NewTracerProvider(
		mergedOptions.TracerProviderOptions...
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