package common

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/grpc-ecosystem/go-grpc-prometheus"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"google.golang.org/grpc"
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
		Name:    "http_request_duration_seconds",
		Help:    "Hostogram of response time for handler in seconds",
		Buckets: prometheus.DefBuckets,
	},
		[]string{"method", "endpoint"})
	testCounter = promauto.NewCounter(prometheus.CounterOpts{
		Name: "test_request_count",
		Help: "testing ",
	})
)

func GrpcInitMetrics(server *grpc.Server) {
	grpc_prometheus.Register(server)
	grpc_prometheus.EnableHandlingTimeHistogram()
}

func HttpInitMetrics(mux *http.ServeMux, pormHost, pormPort string) {
	mux.Handle("/metrics", promhttp.Handler())
	go func() {
        log.Println(http.ListenAndServe(fmt.Sprintf("%s:%s",pormHost, pormPort), nil))
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