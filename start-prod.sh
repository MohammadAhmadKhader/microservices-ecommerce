echo "Starting all services in production mode..."

BASE_DIR=$(pwd)

start bash -c "consul agent -dev"
start bash -c "jaeger"
start bash -c "run-prometheus.bat"
(cd $BASE_DIR/ts-services/products && make run-prod) &
(cd $BASE_DIR/ts-services/auth && make run-prod) &
(cd $BASE_DIR/ts-services/redis && make run-prod) &
(cd $BASE_DIR/ts-services/users && make run-prod) &
(cd $BASE_DIR/golang-services/gateway && make run-prod) &
(cd $BASE_DIR/golang-services/orders && make run-prod) &
wait