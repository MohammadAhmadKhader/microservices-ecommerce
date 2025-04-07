package middlewares

import (
	"context"
	"fmt"
	"net/http"

	"ms/common"
	pb "ms/common/generated"
	"ms/gateway/cookie"
	"ms/gateway/gateway"
	"ms/gateway/shared"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
	"google.golang.org/grpc"
	"google.golang.org/grpc/metadata"
)

func Authenticate(authClient *gateway.AuthGateway, tracer trace.Tracer, allowedPermissions ...pb.PermissionType) func(handler http.HandlerFunc) http.HandlerFunc {
	return func(next http.HandlerFunc) http.HandlerFunc {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := r.Context()
			ctx, span := tracer.Start(ctx, "Authentication-Middleware")
			defer span.End()
			
			span.SetAttributes(attribute.String("allowed_permissions", fmt.Sprintf("%v", allowedPermissions)))

			session, err := cookie.GetCookieSession(w, r)
			if err != nil {
				shared.HandleSpanErr(&span, err)
				common.WriteError(w, http.StatusUnauthorized, err.Error())
				return
			}

			sessionId, err := cookie.GetSessionId(session)
			if err != nil {
				shared.HandleSpanErr(&span, err)
				common.WriteError(w, http.StatusUnauthorized, err.Error())
				return
			}
			
			md := metadata.New(map[string]string{})
			res, err := authClient.ValidateSession(ctx, sessionId, grpc.Header(&md))
			if err != nil {
				shared.HandleSpanErr(&span, err)
				common.WriteError(w, http.StatusUnauthorized, err.Error())
				return
			}

			ctx = metadata.NewOutgoingContext(ctx, md)
		
			err = shared.HandleAuthorization(res.User.GetRoles(), allowedPermissions...)
			if err != nil {
				span.SetAttributes(attribute.String("error.message", fmt.Sprintf("user does not have one of the following permissions: %v", allowedPermissions)))
				shared.HandleSpanErr(&span, err)
				common.WriteError(w, http.StatusUnauthorized, err.Error())
				return
			}
			
			ctx = context.WithValue(ctx, common.UserKey, res.User)

			updatedReq := r.WithContext(ctx)
			span.AddEvent("user was authenticated successfully and passed the authentication middleware")

			next.ServeHTTP(w, updatedReq)
		})
	}
}
