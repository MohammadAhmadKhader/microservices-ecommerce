package gateway

import (
	"context"
	"log"
	"ms/common/discovery"
	pb "ms/common/generated"
)

type AuthGateway struct {
	registry discovery.ServiceRegistry
}

func NewAuthGateway(registry *discovery.Registry) *AuthGateway {
	return &AuthGateway{
		registry: registry,
	}
}

const authService = "auth"

func (g *AuthGateway) ValidateSession(ctx context.Context, sessionId string) (*pb.ValidateSessionResponse, error) {
	conn, err:=discovery.ConnectService(ctx, authService, g.registry)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	authClient := pb.NewAuthServiceClient(conn)
	validationResponse, err := authClient.ValidateSession(context.Background(), &pb.ValidateSessionRequest{SessionId: sessionId})
	if err != nil {
		log.Println(err)
		return nil, err
	}

	return validationResponse, err
}

func (g *AuthGateway) Register(ctx context.Context, registReq *pb.RegistRequest) (*pb.RegistResponse, error) {
	conn, err:=discovery.ConnectService(ctx, authService, g.registry)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	authClient := pb.NewAuthServiceClient(conn)
	registResponse, err := authClient.Regist(ctx, registReq)
	if err != nil {
		log.Println(err)
		return nil, err
	}
	

	return registResponse, err
}

func (g *AuthGateway) Login(ctx context.Context, loginReq *pb.LoginRequest) (*pb.LoginResponse, error) {
	conn, err:=discovery.ConnectService(ctx, authService, g.registry)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	authClient := pb.NewAuthServiceClient(conn)
	loginResponse, err := authClient.Login(context.Background(), loginReq)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	return loginResponse, err
}