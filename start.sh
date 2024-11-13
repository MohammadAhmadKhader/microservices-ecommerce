echo "Starting all services ..."

BASE_DIR=$(pwd)

start bash -c "consul.exe agent -dev"
(cd $BASE_DIR/products && npm run start:dev) &
(cd $BASE_DIR/auth && npm run start:dev) &
(cd $BASE_DIR/redis && npm run start:dev) &
(cd $BASE_DIR/users && npm run start:dev) &
(cd $BASE_DIR/gateway && air) &
(cd $BASE_DIR/orders && air) &
wait

echo "All services have started"