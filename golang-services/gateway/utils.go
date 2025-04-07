package main

import (
	"context"
	"encoding/json"
	"fmt"
	pb "ms/common/generated"

	"net/http"
	"strconv"

	"google.golang.org/grpc/metadata"
)

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

func InjectMetadata(ctx context.Context, userId int32, email string, userRoles []*pb.Role) (context.Context) {
	rolesBytes, err := json.Marshal(userRoles)
	if err != nil {
		rolesBytes = []byte("[]")
	}
	
	return metadata.NewOutgoingContext(ctx, metadata.Pairs(
		"user-id", strconv.Itoa(int(userId)),
		"user-email", email,
		"user-roles", string(rolesBytes),
	))
}


// TODO: will be refactored lately with an interface
// func GetUserPayloadFromCtx(ctx context.Context) (sessions.User, error) {
// 	val := ctx.Value(middlewares.User).(sessions.User)
// 	if val == nil {
// 		return nil, fmt.Errorf("permissioned denied")
// 	}

// 	return val, nil
// }

// func GetUserIdPayloadFromCtx(ctx context.Context) (int32, error) {
// 	userPayload , err:= GetUserPayloadFromCtx(ctx)
// 	if err != nil {

// 	}

// 	return userPayload.GetID(), nil
// }