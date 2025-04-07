package common

import (
	pb "ms/common/generated"
	"net/http"
)

type HeadersCarrier map[string]string

func (a HeadersCarrier) Get(key string) string {
	value, ok := a[key]
	if !ok {
		return ""
	}

	return value
}

func (a HeadersCarrier) Set(key, value string) {
	a[key] = value
}

func (a HeadersCarrier) Keys() []string {
	keys := make([]string, len(a))
	index := 0

	for key := range a {
		keys[index] = key
		index++
	}

	return keys
}

type responseRecorder struct {
	http.ResponseWriter
	statusCode int
}

func (rec *responseRecorder) WriteHeader(code int) {
	rec.statusCode = code
	rec.ResponseWriter.WriteHeader(code)
}

// type Permission struct {
// 	Id uint
// 	Name string
// 	Permissions
// }

// type UserRoles struct {
// 	Id uint
// 	Name string
// 	Permissions
// }

type UserData struct {
	UserId uint
	Email string
	Roles []*pb.Role
}

func NewUserData(userId uint, email string, roles []*pb.Role) *UserData {

	return &UserData{
		UserId: userId,
		Email: email,
		Roles: roles,
	}
}

type UserKeyType string

const UserKey = UserKeyType("UserKey")