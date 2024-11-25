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
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
)

const (
	defaultLimit = 10
	maxLimit     = 100
)

func GetPagination(r *http.Request) (int32, int32, error) {
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
	return json.NewDecoder(r.Body).Decode(data)
}

func WriteError(w http.ResponseWriter, status int, message string) {
	WriteJSON(w, status, map[string]string{"error": message})
}

func HandleGrpcErr(err error, status *status.Status, w http.ResponseWriter, customStatus *int) {
	if status.Code() != codes.InvalidArgument {
		var returnedStatus = http.StatusBadRequest
		if customStatus != nil {
			returnedStatus = *customStatus
		}

		WriteError(w, returnedStatus, status.Message())
		return
	}

	WriteError(w, http.StatusInternalServerError, err.Error())
}

func InjectMetadataIntoContext(ctx context.Context) HeadersCarrier {
	carrier := make(HeadersCarrier)
	otel.GetTextMapPropagator().Inject(ctx, carrier)

	return carrier
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