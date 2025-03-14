package users

import (
	pb "ms/common/generated"
	"time"
)

type RegisterResponsec struct {
	ID int32 `json:"id"`
	FirstName string    `json:"firstName"`
	LastName string `json:"lastName"`
	Email string `json:"email"`
	UpdatedAt time.Time `json:"updatedAt"`
	CreatedAt time.Time `json:"createdAt"`
}

func ConvertUserToResponse(user *pb.User) RegisterResponsec {
	return RegisterResponsec{
		ID: user.Id,
		FirstName: user.FirstName,
		LastName: user.LastName,
		Email: user.Email,
		UpdatedAt: user.UpdatedAt.AsTime(),
		CreatedAt: user.CreatedAt.AsTime(),
	}
}
