package discovery

import (
	"context"
	"fmt"
	"log"
	"strconv"
	"strings"

	capi "github.com/hashicorp/consul/api"
	_ "google.golang.org/grpc"
	_ "google.golang.org/grpc/health"
	_ "google.golang.org/grpc/health/grpc_health_v1"
)

type Registry struct {
	consulClient *capi.Client
}

func NewRegistry(address string) (*Registry, error) {
	config := capi.DefaultConfig()
	config.Address = address
	consulClient, err := capi.NewClient(config)
	if err != nil {
		return nil, err
	}

	return &Registry{
		consulClient: consulClient,
	}, nil
}

func (r *Registry) Register(ctx context.Context, instanceId, grpcAddr, serviceName string) error {
	hostPort := strings.Split(grpcAddr, ":")
	portStr := hostPort[1]
	host := hostPort[0]
	
	portInt, err := strconv.Atoi(portStr)
	if err != nil {
		log.Println(err)
		return err
	}

	check := &capi.AgentServiceCheck{
		CheckID: 					instanceId,
		TTL: "10s",
		Status: "passing",
		Timeout:                        "2s",
		DeregisterCriticalServiceAfter: "2s",
		TLSSkipVerify:                  true,
		
	}

	return r.consulClient.Agent().ServiceRegister(&capi.AgentServiceRegistration{
		ID:      instanceId,
		Name:    serviceName,
		Address: host,
		Port:    portInt,
		Check:   check,
	})
}

// checkId is same as instanceId in our application
func (r *Registry) UpdateHealthCheck(checkId, serviceName string) error {
	log.Printf("updated health check for instantId: '%s' \n", checkId)
	return r.consulClient.Agent().UpdateTTL(checkId, "online", capi.HealthPassing)
}

func (r *Registry) Deregister(ctx context.Context, instanceId string) error {
	log.Println("Removing service with id: ", instanceId)
	return r.consulClient.Agent().CheckDeregister(instanceId)
}

func (r *Registry) Discover(ctx context.Context, serviceName string) ([]string, error) {
	servicesEntries, _, err := r.consulClient.Health().Service(serviceName, "", true, nil)
	if err != nil {
		log.Println("an unexpected error has occurred during fetching services of service: "+serviceName, err)
		return nil, err
	}

	services := []string{}
	for _, entry := range servicesEntries {
		hostPort := fmt.Sprintf("%v:%v", entry.Node.Address, entry.Service.Port)
		services = append(services, hostPort)
	}

	return services, nil
}


//healthServer := health.NewServer()
//grpc_health_v1.RegisterHealthServer(grpcServer, healthServer)
//healthServer.SetServingStatus(grpcServiceName, grpc_health_v1.HealthCheckResponse_SERVING)
