package users

import (
	pb "ms/common/generated"
	"time"
)

type User struct {
	ID int32 `json:"id"`
	FirstName string    `json:"firstName"`
	LastName string `json:"lastName"`
	Email string `json:"email"`
	UpdatedAt time.Time `json:"updatedAt"`
	CreatedAt time.Time `json:"createdAt"`
}

func ConvertUserToResponse(user *pb.AuthUser) User {
	return User{
		ID: user.Id,
		FirstName: user.FirstName,
		LastName: user.LastName,
		Email: user.Email,
		UpdatedAt: user.UpdatedAt.AsTime(),
		CreatedAt: user.CreatedAt.AsTime(),
	}
}

func (u *User) GetID() int32 {
	return u.ID
}

func (u *User) GetFirstName() string {
	return u.FirstName
}

func (u *User) GetLastName() string {
	return u.LastName
}

func (u *User) GetEmail() string {
	return u.Email
}

func (u *User) GetUpdatedAt() time.Time {
	return u.UpdatedAt
}

func (u *User) GetCreatedAt() time.Time {
	return u.CreatedAt
}