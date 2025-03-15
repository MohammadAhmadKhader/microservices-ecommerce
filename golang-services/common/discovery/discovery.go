package discovery

import (
	"context"
	"fmt"
	"math/rand"
	"time"
)

type ServiceRegistry interface {
	Register(ctx context.Context, instanceId, addrWithPort, serviceName string) error
	Deregister(ctx context.Context, instanceId string) error
	UpdateHealthCheck(checkId string, serviceName string) error
	Discover(ctx context.Context, serviceName string) ([]string, error)
}

func GenInstanceId(service string) string {
	return fmt.Sprintf("%v-%v", service, rand.New(rand.NewSource(time.Now().Unix())).Int())
}