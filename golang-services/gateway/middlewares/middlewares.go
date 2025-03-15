package middlewares

import (
	"context"
	"net/http"

	"ms/common"
	"ms/gateway/cookie"
	"ms/gateway/gateway"
	"ms/orders/utils"

	"go.opentelemetry.io/otel/trace"
)

type UserKey string

const User = UserKey("UserKey")

func Authenticate(authClient *gateway.AuthGateway, tracer trace.Tracer) func(handler http.HandlerFunc) http.HandlerFunc {
	return func(next http.HandlerFunc) http.HandlerFunc {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := r.Context()
			ctx, span := tracer.Start(ctx, "Authentication-Middleware")
			defer span.End()
			
			session, err := cookie.GetCookieSession(w, r)
			if err != nil {
				utils.HandleSpanErr(&span, err)
				common.WriteError(w, http.StatusUnauthorized, err.Error())
				return
			}

			sessionId, err := cookie.GetSessionId(session)
			if err != nil {
				utils.HandleSpanErr(&span, err)
				common.WriteError(w, http.StatusUnauthorized, err.Error())
				return
			}
			
			validateSessionResponse, err := authClient.ValidateSession(ctx, sessionId)
			if err != nil {
				utils.HandleSpanErr(&span, err)
				common.WriteError(w, http.StatusUnauthorized, err.Error())
				return
			}

			ctx = context.WithValue(ctx, User, validateSessionResponse.User)

			updatedReq := r.WithContext(ctx)
			span.AddEvent("user was authenticated successfully and passed the authentication middleware")

			next.ServeHTTP(w, updatedReq)
		})
	}
}
