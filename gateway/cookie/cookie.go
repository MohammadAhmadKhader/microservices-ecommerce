package cookie

import (
	"fmt"
	"ms/common/common-go"
	"net/http"
	"strconv"

	"github.com/gorilla/sessions"
)

var store = sessions.NewCookieStore([]byte(common.EnvString("COOKIE_SECRET", "")))

func GetCookieSession(w http.ResponseWriter, r *http.Request) (*sessions.Session, error) {
	session, err := store.Get(r, "cookie-session")
	if err != nil {
		return nil, err
	}

	return session, nil
}

func SetCookie(w http.ResponseWriter, r *http.Request, sessionId string) (*sessions.Session, error) {
	session, err := store.New(r, "cookie-session")
	if err != nil {
		return nil, err
	}

	cookieMaxAgeStr := common.EnvString("COOKIE_MAXAGE", "")
	cookieMaxAge, err := strconv.Atoi(cookieMaxAgeStr)
	if err != nil {
		return nil, err
	}

	session.Options = &sessions.Options{
		MaxAge:   cookieMaxAge,
		Path:     "/api",
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteStrictMode,
	}

	session.Values["sessionId"] = sessionId

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
