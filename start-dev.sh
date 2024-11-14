echo "Starting all services in development mode..."

BASE_DIR=$(pwd)

start bash -c "consul.exe agent -dev"
(cd $BASE_DIR/ts-services/products && make run-dev) &
(cd $BASE_DIR/ts-services/auth && make run-dev) &
(cd $BASE_DIR/ts-services/redis && make run-dev) &
(cd $BASE_DIR/ts-services/users && make run-dev) &
(cd $BASE_DIR/golang-services/gateway && make run-dev) &
(cd $BASE_DIR/golang-services/orders && make run-dev) &
wait