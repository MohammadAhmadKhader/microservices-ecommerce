package gateway

import (
	"context"
	"log"
	"ms/common/discovery"
	pb "ms/common/generated"

	"google.golang.org/grpc"
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

func (g *AuthGateway) ValidateSession(ctx context.Context, sessionId string, opts ...grpc.CallOption) (*pb.ValidateSessionResponse, error) {
	conn, err:=discovery.ConnectService(ctx, authService, g.registry)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	authClient := pb.NewAuthServiceClient(conn)
	validationResponse, err := authClient.ValidateSession(ctx, &pb.ValidateSessionRequest{SessionId: sessionId}, opts...)
	if err != nil {
		log.Println(err)
		return nil, err
	}
	
	return validationResponse, err
}

func (g *AuthGateway) Register(ctx context.Context, registReq *pb.RegistRequest, opts ...grpc.CallOption) (*pb.RegistResponse, error) {
	conn, err:=discovery.ConnectService(ctx, authService, g.registry)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	authClient := pb.NewAuthServiceClient(conn)
	registResponse, err := authClient.Regist(ctx, registReq, opts...)
	if err != nil {
		log.Println(err)
		return nil, err
	}
	

	return registResponse, err
}

func (g *AuthGateway) Login(ctx context.Context, loginReq *pb.LoginRequest, opts ...grpc.CallOption) (*pb.LoginResponse, error) {
	conn, err:=discovery.ConnectService(ctx, authService, g.registry)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	authClient := pb.NewAuthServiceClient(conn)
	loginResponse, err := authClient.Login(ctx, loginReq, opts...)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	return loginResponse, err
}