package common

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"

	"go.opentelemetry.io/otel"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/proto"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
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

func ServiceIPGetter(ctx context.Context) (string, error) {
	kubeConfig := os.Getenv("KUBCONFIG")
	if kubeConfig == "" {
		return "", fmt.Errorf("kubeConfig was not found")
	}

	config, err := clientcmd.BuildConfigFromFlags("", kubeConfig)
	if err != nil {
		return "", err
	}

	clinetset, err := kubernetes.NewForConfig(config)
	if err != nil {
		return "", err
	}

	podName := os.Getenv("POD_NAME")
	namespace := os.Getenv("POD_NAMESPACE")

	pod, err := clinetset.CoreV1().Pods(namespace).Get(ctx, podName, metav1.GetOptions{})
	if err != nil {
		return "", err
	}
	podIP := pod.Status.PodIP

	return podIP, nil
}

func IsGrpcError(err error) bool {
	if err == nil {
		return false
	}

	_, ok := status.FromError(err)
	return ok
}