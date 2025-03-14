package main

import (
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/trace"
)

func HandleSpanErr(span *trace.Span, err error) {
	(*span).SetStatus(codes.Error, err.Error())
	(*span).RecordError(err)
}