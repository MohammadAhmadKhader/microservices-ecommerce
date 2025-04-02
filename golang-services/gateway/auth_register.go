package main

import (
	"ms/common"
	pb "ms/common/generated"
	"ms/gateway/cookie"
	usersTypes "ms/gateway/types/users"
	"ms/orders/utils"
	"net/http"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"google.golang.org/grpc/status"
)

func (h *handler) authRegister(mux *http.ServeMux) {
	mux.HandleFunc("POST /api/auth/login", h.HandleLogin)
	mux.HandleFunc("POST /api/auth/register", h.HandleRegist)
}

func (h *handler) HandleLogin(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "HandleLogin Gateway")
	defer span.End()

	var loginPayload pb.LoginRequest
	err := common.ReadJSON(r, &loginPayload)
	if err != nil {
		utils.HandleSpanErr(&span, err)
		common.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	copyLoginPayload, err := common.CopyProto(&loginPayload)
	if err != nil {
		utils.HandleSpanErr(&span, err)
		common.WriteError(w, http.StatusInternalServerError, err.Error())
		return
	}

	copyLoginPayload.Password = "[REDACTED]"
	span.SetAttributes(attribute.Stringer("payload", copyLoginPayload))

	loginResponse, err := h.authGateway.Login(ctx, &loginPayload)
	rStatus := status.Convert(err)
	if rStatus != nil {
		utils.HandleSpanErr(&span, err)
		common.HandleGrpcErr(err, rStatus, w, nil)
		return
	}

	_, err = cookie.SetCookie(w, r, loginResponse.GetSession())
	if err != nil {
		utils.HandleSpanErr(&span, err)
		common.WriteError(w, http.StatusInternalServerError, err.Error())
		return
	}

	userResp := usersTypes.ConvertUserToResponse(loginResponse.User)

	common.WriteJSON(w, http.StatusOK, map[string]any{"user": userResp})
}

func (h *handler) HandleRegist(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "HandleRegist Gateway")
	defer span.End()
	
	var registPayload pb.RegistRequest
	err := common.ReadJSON(r, &registPayload)
	if err != nil {
		utils.HandleSpanErr(&span, err)
		common.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	registPayloadClone, err := common.CopyProto(&registPayload)
	if err != nil {
		utils.HandleSpanErr(&span, err)
		common.WriteError(w, http.StatusInternalServerError, err.Error())
		return
	}

	registPayloadClone.Password = "[REDACTED]"
	span.SetAttributes(attribute.Stringer("payload", registPayloadClone))

	loginResponse, err := h.authGateway.Register(ctx, &registPayload)
	if err != nil {
		utils.HandleSpanErr(&span, err)
		rStatus := status.Convert(err)
		common.HandleGrpcErr(err, rStatus, w, nil)
		return
	}

	_, err = cookie.SetCookie(w, r, loginResponse.GetSession())
	if err != nil {
		utils.HandleSpanErr(&span, err)
		common.WriteError(w, http.StatusInternalServerError, err.Error())
		return
	}
	
	userResp := usersTypes.ConvertUserToResponse(loginResponse.User)
	span.SetStatus(codes.Ok, "user has registed successfully")

	common.WriteJSON(w, http.StatusOK, map[string]any{"user": userResp})
}
