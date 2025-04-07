package shared

import (
	"fmt"
	pb "ms/common/generated"
	"slices"
	"strings"

	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/trace"
)

// If allowedPermissions is an empty array its considered authorized
func HandleAuthorization(userRoles []*pb.Role, allowedPermissions ...pb.PermissionType) error {
	if len(allowedPermissions) > 0 {
		for _, role := range userRoles {
			for _, permission := range role.Permissions {
				permissionTypeStr := MapPermissionToEnum(permission.Name)

				if slices.Contains(allowedPermissions, pb.PermissionType(permissionTypeStr)) {
					return nil
				}
			}
		}

		return fmt.Errorf("unauthorized")
	}

	return nil
}

func MapPermissionToEnum(permissionName string) pb.PermissionType {
	switch strings.ToUpper(permissionName) {
	case "DASHBOARD_PRODUCT_VIEW":
		return pb.PermissionType_DASHBOARD_PRODUCT_VIEW
	case "DASHBOARD_PRODUCT_CREATE":
		return pb.PermissionType_DASHBOARD_PRODUCT_CREATE
	case "DASHBOARD_PRODUCT_UPDATE":
		return pb.PermissionType_DASHBOARD_PRODUCT_UPDATE
	case "DASHBOARD_PRODUCT_DELETE":
		return pb.PermissionType_DASHBOARD_PRODUCT_DELETE
	case "DASHBOARD_ROLE_VIEW":
		return pb.PermissionType_DASHBOARD_ROLE_VIEW
	case "DASHBOARD_ROLE_CREATE":
		return pb.PermissionType_DASHBOARD_ROLE_CREATE
	case "DASHBOARD_ROLE_UPDATE":
		return pb.PermissionType_DASHBOARD_ROLE_UPDATE
	case "DASHBOARD_ROLE_DELETE":
		return pb.PermissionType_DASHBOARD_ROLE_DELETE
	case "DASHBOARD_ROLE_ASSIGN":
		return pb.PermissionType_DASHBOARD_ROLE_ASSIGN
	case "DASHBOARD_ROLE_UN_ASSIGN":
		return pb.PermissionType_DASHBOARD_ROLE_UN_ASSIGN
	case "DASHBOARD_ORDER_VIEW":
		return pb.PermissionType_DASHBOARD_ORDER_VIEW
	case "ORDER_PURCHASE":
		return pb.PermissionType_ORDER_PURCHASE
	case "ORDER_UPDATE_STATUS":
		return pb.PermissionType_ORDER_UPDATE_STATUS
	case "ORDER_CANCEL":
		return pb.PermissionType_ORDER_CANCEL
	case "USER_VIEW":
		return pb.PermissionType_USER_VIEW
	case "USER_CREATE":
		return pb.PermissionType_USER_CREATE
	case "USER_UPDATE":
		return pb.PermissionType_USER_UPDATE
	case "USER_DELETE":
		return pb.PermissionType_USER_DELETE
	case "DASHBOARD_USER_DELETE":
		return pb.PermissionType_DASHBOARD_USER_DELETE
	default:
		return pb.PermissionType_PERMISSION_UNKNOWN
	}
}

func HandleSpanErr(span *trace.Span, err error) {
	(*span).SetStatus(codes.Error, err.Error())
	(*span).RecordError(err)
}