package common

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/grpc-ecosystem/go-grpc-prometheus"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

var (
	gatewayTotalRequest = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "api_gateway_total_requests",
			Help: "Total Requests on the api gateway",
		},
		[]string{"method", "endpoint", "status"},
	)
	gatewayRequestDuration = promauto.NewHistogramVec(prometheus.HistogramOpts{
		Name:    "api_gateway_duration_seconds",
		Help:    "Histogram of response time for requests through api-gateway in seconds",
		Buckets: prometheus.DefBuckets,
	},
		[]string{"method", "endpoint"})
	grpcRequestsCounter = promauto.NewCounterVec(prometheus.CounterOpts{
		Name:    "grpc_ms_app_requests",
		Help:    "Grpc requests for microservices app",
	},
		[]string{"service", "method", "status_code"})
	grpcReqeustsDuration = promauto.NewHistogramVec(prometheus.HistogramOpts{
		Name:    "grpc_ms_app_request_duration_seconds",
		Help:    "Duration of gRPC requests in seconds",
		Buckets: prometheus.DefBuckets,
	},
		[]string{"service", "method"})
)

func GrpcInitMetrics(server *grpc.Server) {
	grpc_prometheus.Register(server)
	grpc_prometheus.EnableHandlingTimeHistogram()
}

func HttpInitMetrics(mux *http.ServeMux, serviceHost, metricsPort string) {
	mux.Handle("/metrics", promhttp.Handler())
	go func() {
        log.Println(http.ListenAndServe(fmt.Sprintf("%s:%s",serviceHost, metricsPort), nil))
    }()
}

func CreateHttpMetricsAndInit(serviceHost, metricsPort string) {
	mux := http.NewServeMux()
	mux.Handle("/metrics", promhttp.Handler())
	go func() {
        log.Println(http.ListenAndServe(fmt.Sprintf("%s:%s",serviceHost, metricsPort), mux))
    }()
}

func MetricsHandler(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		rr := responseRecorder{ResponseWriter: w}
		next.ServeHTTP(&rr, r)
		duration := time.Since(start).Seconds()

		gatewayTotalRequest.WithLabelValues(r.Method, r.URL.Path, http.StatusText(rr.statusCode)).Inc()
		gatewayRequestDuration.WithLabelValues(r.Method, r.URL.Path).Observe(duration)
	})
}

func GrpcMetricsInterceptor(serviceName string) grpc.UnaryServerInterceptor {
	return func(ctx context.Context, req any, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler)(resp any, err error) {
		start := time.Now()
		resp, err = handler(ctx, req)
		duration := time.Since(start).Seconds()

		grpcMethod := info.FullMethod
		statusCode := codes.OK.String()
		if err != nil {
			statusCode = status.Code(err).String()
		}

		grpcRequestsCounter.WithLabelValues(serviceName, grpcMethod, statusCode).Inc()
		grpcReqeustsDuration.WithLabelValues(serviceName, grpcMethod).Observe(duration)

		return resp, err
	}
}