package middlewares

import (
	"context"
	"net/http"

	"ms/common/common-go"
	"ms/gateway/cookie"
	"ms/gateway/gateway"
)

type UserKey string

const User = UserKey("UserKey")

func Authenticate(authClient *gateway.AuthGateway) func(handler http.HandlerFunc) http.HandlerFunc {
	return func(next http.HandlerFunc) http.HandlerFunc {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			session, err := cookie.GetCookieSession(w, r)
			if err != nil {
				common.WriteError(w, http.StatusUnauthorized, err.Error())
				return
			}

			sessionId, err := cookie.GetSessionId(session)
			if err != nil {
				common.WriteError(w, http.StatusUnauthorized, err.Error())
				return
			}

			validateSessionResponse, err := authClient.ValidateSession(context.Background(), sessionId)
			if err != nil {
				common.WriteError(w, http.StatusUnauthorized, err.Error())
				return
			}
			ctx := context.WithValue(r.Context(), User, validateSessionResponse.User)

			updatedReq := r.WithContext(ctx)
			next.ServeHTTP(w, updatedReq)
		})
	}
}
