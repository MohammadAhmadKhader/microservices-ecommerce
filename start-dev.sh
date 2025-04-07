echo "Starting all services in development mode..."

BASE_DIR=$(pwd)

start bash -c "consul agent -dev"
start bash -c "jaeger"
start bash -c "run-prometheus.bat"
(cd $BASE_DIR/ts-services/products && bash -c "make run-dev") &
(cd $BASE_DIR/ts-services/auth && bash -c "make run-dev") &
(cd $BASE_DIR/ts-services/redis && bash -c "make run-dev") &
(cd $BASE_DIR/ts-services/users && bash -c "make run-dev") &
(cd $BASE_DIR/golang-services/gateway && bash -c "make run-dev") &
(cd $BASE_DIR/golang-services/orders && bash -c "make run-dev") &
(cd $BASE_DIR/golang-services/carts && bash -c "make run-dev") &
wait