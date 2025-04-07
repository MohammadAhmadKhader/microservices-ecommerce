package common

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	pb "ms/common/generated"
	"net/http"
	"strconv"

	"go.opentelemetry.io/otel"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/proto"
)

const (
	defaultLimit = 10
	maxLimit     = 100
)

func GetPagination(r *http.Request) (Page int32, Limit int32,err error) {
	page, err := strconv.Atoi(r.URL.Query().Get("page"))
	if err != nil {
		return 0, 0, err
	}

	limit, err := strconv.Atoi(r.URL.Query().Get("limit"))
	if err != nil {
		return 0, 0, err
	}

	if page <= 0 {
		page = 1
	}
	if limit > 100 {
		limit = maxLimit
	}
	if limit < 3 {
		limit = defaultLimit
	}

	return int32(page), int32(limit), nil
}

func WriteJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")

	if rec, ok := w.(*responseRecorder); ok {
		rec.WriteHeader(status)
	} else {
		log.Println("Error: Expected '*responseRecorder' type received 'http.ResponseWriter' ")
		w.WriteHeader(status)
	}

	json.NewEncoder(w).Encode(data)
}

func ReadJSON(r *http.Request, data interface{}) error {
	err := json.NewDecoder(r.Body).Decode(data)
	if err != nil && err.Error() == "EOF" {
		return fmt.Errorf("body is empty")
	}
	return err
}

func WriteError(w http.ResponseWriter, status int, message string) {
	WriteJSON(w, status, map[string]string{"error": message})
}

func IsExpectedCode(code codes.Code) bool {
	return code == codes.InvalidArgument || 
	code == codes.AlreadyExists || code == codes.NotFound || 
	code == codes.PermissionDenied || code == codes.FailedPrecondition ||
	code == codes.Unauthenticated
}

var StatusCodesMap = map[codes.Code]int{
	codes.PermissionDenied: http.StatusUnauthorized,
	codes.Unauthenticated: http.StatusForbidden,
	codes.AlreadyExists: http.StatusBadRequest,
	codes.InvalidArgument: http.StatusBadRequest,
	codes.NotFound: http.StatusBadRequest,
	codes.FailedPrecondition: http.StatusPreconditionFailed,
}

func MapRpcCodesToHttpCodes(rpcCode codes.Code) (httpStatusCode int) {
	httpStatusCode = StatusCodesMap[rpcCode]
	return httpStatusCode
}

func HandleGrpcErr(err error, status *status.Status, w http.ResponseWriter, customStatus *int) {
	if IsExpectedCode(status.Code()) {
		returnedStatus := MapRpcCodesToHttpCodes(status.Code())
		WriteError(w, returnedStatus, status.Message())
		return
	}

	WriteError(w, http.StatusInternalServerError, "internal server error")
}

func InjectMetadataIntoContext(ctx context.Context) HeadersCarrier {
	carrier := make(HeadersCarrier)
	otel.GetTextMapPropagator().Inject(ctx, carrier)

	return carrier
}

func CopyProto[TProto proto.Message](loginPayload TProto) (TProto, error) {
	pMsg := proto.Clone(loginPayload)
	var casted, ok = pMsg.(TProto)
	if !ok {
		return *new(TProto), fmt.Errorf("invalid proto.Message")
	}

	return casted, nil
}

func IsGrpcError(err error) bool {
	if err == nil {
		return false
	}

	_, ok := status.FromError(err)
	return ok
}

func GetUserData(ctx context.Context) (*UserData, error){
	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		return nil, fmt.Errorf("metadata not found in context")
	}

	idArr := md.Get("user-id")
	emailArr := md.Get("user-email")
	rolesArr := md.Get("user-roles")
	if len(idArr) == 0 {
		return nil, fmt.Errorf("missing userId from metadata")
	}

	if len(emailArr) == 0 {
		return nil, fmt.Errorf("missing email from metadata")
	}

	if len(rolesArr) == 0 {
		return nil, fmt.Errorf("missing roles from metadata")
	}

	idAsStr := idArr[0]
	idAsUint, err :=  strconv.ParseUint(idAsStr, 10, 64)
	if err != nil {
		return nil, fmt.Errorf("an error has occured during attempt to parse userId")
	}

	roles, err := EncodeUserRolesFromMetaData(rolesArr)
	if err != nil {
		return nil, fmt.Errorf("an error has occured during encoding user roles from metadata")
	}

	return NewUserData(uint(idAsUint), emailArr[0], roles), nil
}

func EncodeUserRolesFromMetaData(rolesStringArr []string) ([]*pb.Role, error) {
	var rolesInMD [][]*pb.Role
	for _, str := range rolesStringArr {
		var roles []*pb.Role
		if err := json.Unmarshal([]byte(str), &roles); err != nil {
			return nil, fmt.Errorf("failed to decode role from metadata: %w", err)
		}

		rolesInMD = append(rolesInMD, roles)
	}

	return rolesInMD[0], nil
}

func ExtractUserID(ctx context.Context) (uint, error) {
	md, err := ExtractMD(ctx)
	if err != nil {
		return 0, fmt.Errorf("missing metadata")
	}

	if !(len(md.Get("user-id")) > 0) {
		return 0, fmt.Errorf("missing user-id from metadata")
	}
	idAsStr := md.Get("user-id")[0]
	if idAsStr == "" {
		return 0, fmt.Errorf("userId was not found")
	}

	idAsUint, err :=  strconv.ParseUint(idAsStr, 10, 64)
	if err != nil {
		return 0, fmt.Errorf("an error has occured during attempt to parse userId")
	}

	return uint(idAsUint), nil
}

func ExtractMD(ctx context.Context) (metadata.MD, error) {
	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		md, ok = metadata.FromOutgoingContext(ctx)
		if !ok {
			return nil, fmt.Errorf("missing metadata")
		}
	}
	
	return md, nil
}

func ExtractIncommingMD(ctx context.Context) (metadata.MD, error) {
	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		return nil, fmt.Errorf("missing metadata")
	}
	
	return md, nil
}

func ExtractOutcommingMD(ctx context.Context) (metadata.MD, error) {
	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		return nil, fmt.Errorf("missing metadata")
	}
	
	return md, nil
}