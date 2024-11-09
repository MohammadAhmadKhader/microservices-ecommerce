package main

import (
	"context"
	"ms/common/common-go"
	"ms/gateway/cookie"
	pb "ms/gateway/generated"
	"net/http"
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

	loginResponse, err := h.authClient.Login(context.Background(),
		&pb.LoginRequest{Email: loginPayload.Email, Password: loginPayload.Password})
	if err != nil {
		common.WriteError(w, http.StatusBadRequest, err.Error())
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

	loginResponse, err := h.authClient.Regist(context.Background(),
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
