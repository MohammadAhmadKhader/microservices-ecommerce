package common

import (
	"encoding/json"
	"net/http"
	"strconv"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

const (
	defaultLimit = 10
	maxLimit = 100
)

func GetPagination(r *http.Request) (int32, int32, error) {
	page ,err := strconv.Atoi(r.URL.Query().Get("page"))
	if err != nil {
		return 0,0,err
	}

	limit ,err := strconv.Atoi(r.URL.Query().Get("limit"))
	if err != nil {
		return 0,0,err
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
	w.Header().Set("Content-Type","application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func ReadJSON(r *http.Request, data interface{}) error {
	return json.NewDecoder(r.Body).Decode(data)
}

func WriteError(w http.ResponseWriter, status int, message string) {
	WriteJSON(w, status, map[string]string{"error":message})
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