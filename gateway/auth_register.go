package main

import (
	"context"
	"ms/common/common-go"
	"ms/gateway/cookie"
	pb "ms/gateway/generated"
	"net/http"

	"google.golang.org/grpc/status"
)

// auth

func (h *handler) authRegister(mux *http.ServeMux) {
	mux.HandleFunc("POST /api/auth/login", h.HandleLogin)
	mux.HandleFunc("POST /api/auth/regist", h.HandleRegist)
}

func (h *handler) HandleLogin(w http.ResponseWriter, r *http.Request) {
	var loginPayload pb.LoginRequest
	err := common.ReadJSON(r, &loginPayload)
	if err != nil {
		common.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	loginResponse, err := h.authGateway.Login(context.Background(),
		&pb.LoginRequest{Email: loginPayload.Email, Password: loginPayload.Password})
	rStatus := status.Convert(err)
	if rStatus != nil {
		common.HandleGrpcErr(err, rStatus, w, nil)
		return
	}

	_, err = cookie.SetCookie(w, r, loginResponse.SessionId)
	if err != nil {
		common.WriteError(w, http.StatusInternalServerError, err.Error())
		return
	}

	common.WriteJSON(w, http.StatusOK, map[string]any{"user": loginResponse.User})
}

func (h *handler) HandleRegist(w http.ResponseWriter, r *http.Request) {
	var registPayload pb.RegistRequest
	err := common.ReadJSON(r, &registPayload)
	if err != nil {
		common.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	loginResponse, err := h.authGateway.Register(context.Background(),
		&pb.RegistRequest{
			FirstName: registPayload.FirstName, LastName: registPayload.LastName,
			Email: registPayload.Email, Password: registPayload.Password,
		})
	if err != nil {
		common.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	cookie.SetCookie(w, r, loginResponse.SessionId)

	common.WriteJSON(w, http.StatusOK, map[string]any{"user": loginResponse.User})
}
