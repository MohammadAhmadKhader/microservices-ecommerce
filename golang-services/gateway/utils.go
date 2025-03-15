package main

import (
	"context"
	"fmt"
	"ms/gateway/middlewares"
	"ms/gateway/types/sessions"
	"net/http"
	"strconv"

	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/trace"
)

func HandleSpanErr(span *trace.Span, err error) {
	(*span).SetStatus(codes.Error, err.Error())
	(*span).RecordError(err)
}

func GetPathValueAsInt(r *http.Request, name string) (int, error) {
	idStr := r.PathValue(name)
	if idStr == "" {
		return 0, fmt.Errorf("%v is required", name)
	}

	id, err := strconv.Atoi(idStr)
	if err != nil {
		return 0, err
	}

	return id, nil
}

func GetUserPayloadFromCtx(ctx context.Context) (sessions.UserPayload, error) {
	val := ctx.Value(middlewares.User).(sessions.UserPayload)
	if val == nil {
		return nil, fmt.Errorf("permissioned denied",)
	}

	return val, nil
}

func GetUserIdPayloadFromCtx(ctx context.Context) (int32, error) {
	userPayload , err:= GetUserPayloadFromCtx(ctx)
	if err != nil {

	}

	return userPayload.GetUser().GetID(), nil
}