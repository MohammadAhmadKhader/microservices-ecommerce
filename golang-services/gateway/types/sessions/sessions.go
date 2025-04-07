package sessions

import "time"

type UserPayload interface {
	GetUser() User
	GetSessionID() string
}

type User interface {
	GetID() int32
	GetFirstName() string
	GetLastName() string
	GetEmail() string
	GetUpdatedAt() time.Time
	GetCreatedAt() time.Time
}