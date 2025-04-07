package cookie

import (
	"context"
	"fmt"
	"ms/common"
	pb "ms/common/generated"

	"net/http"

	"github.com/gorilla/sessions"
	"google.golang.org/grpc/metadata"
)

var store = sessions.NewCookieStore([]byte(common.EnvString("COOKIE_SECRET", "")))

func GetCookieSession(w http.ResponseWriter, r *http.Request) (*sessions.Session, error) {
	session, err := store.Get(r, "cookie-session")
	if err != nil {
		return nil, err
	}

	return session, nil
}

func SetCookie(w http.ResponseWriter, r *http.Request, pbSession *pb.Session) (*sessions.Session, error) {
	session, err := store.New(r, "cookie-session")
	if err != nil {
		return nil, err
	}

	session.Options = &sessions.Options{
		MaxAge:   int(pbSession.GetCookieMaxAge()),
		Path:     "/api",
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteStrictMode,
	}

	session.Values["sessionId"] = pbSession.GetId()
	session.Values["expiresAt"] = pbSession.GetExpiresAt()
	session.Values["createdAt"] = pbSession.GetCreatedAt()

	err = session.Save(r, w)
	if err != nil {
		return nil, err
	}

	return session, nil
}

func GetSessionId(session *sessions.Session) (string, error) {
	sessionId := session.Values["sessionId"]
	sessionIdAsString, ok := sessionId.(string)
	if !ok {
		return "", fmt.Errorf("cookie does not contain session id")
	}

	return sessionIdAsString, nil
}

func SetUserIdToMD(ctx context.Context, userId int32) context.Context {
	ctx = metadata.AppendToOutgoingContext(ctx,"userId", string(userId))
	return ctx
}