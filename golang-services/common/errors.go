package common

import (
	"errors"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

var (
	ErrNoItems = errors.New("at least one item is required")
)

func ErrInternal() error {
    return status.Error(codes.Internal, "internal server error")
}

func ErrInternalWithReason(reason string) error {
    return status.Errorf(codes.Internal, "internal server error, reason: %s", reason)
}

func ErrInvalidArgument(reason string) error {
    return status.Errorf(codes.InvalidArgument, "invalid argument, reason: %s", reason)
}

func ErrNotFound(resource string, id any) error {
    return status.Errorf(codes.NotFound, "%s with ID %v not found", resource, id)
}

func ErrAlreadyExists(resource string, id any) error {
    return status.Errorf(codes.AlreadyExists, "%s with ID %v already exists", resource, id)
}

func ErrPermissionDenied() error {
	return status.Error(codes.PermissionDenied, "permission denied")
}

func ErrUnauthenticated() error {
	return status.Error(codes.Unauthenticated, "unauthenticated")
}

func ErrUnauthenticatedWithReason(reason string) error {
	return status.Errorf(codes.Unauthenticated, "unauthenticated, reason: %s", reason)
}

func ErrFailedPrecondition(condition string) error {
	return status.Errorf(codes.FailedPrecondition, "failed precondition: %s", condition)
}

// CheckGrpcErrorOrInternal checks if the error is a gRPC error, and if not, returns gRPC internal error.
func CheckGrpcErrorOrInternal(err error) error {
    if _, ok := status.FromError(err); ok {
        return err
    }

    return status.Error(codes.Internal, "internal error")
}