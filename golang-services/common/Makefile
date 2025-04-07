
SHELL=cmd.exe
generate:
	IF EXIST "generated" rmdir /s /q "generated"
	mkdir "generated"
	protoc --go_out=./generated --go_opt=paths=source_relative \
    --go-grpc_out=./generated --go-grpc_opt=paths=source_relative \
	--proto_path=../../protos \
	../../protos/products.proto \
	../../protos/auth.proto \
	../../protos/redis.proto \
	../../protos/users.proto \
	../../protos/shared.proto \
	../../protos/orders.proto \
	../../protos/roles.proto \
	../../protos/permissions.proto \
	../../protos/carts.proto \