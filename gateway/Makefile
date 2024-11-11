generate:
	@IF EXIST "generated" rmdir /s /q "generated"
	@mkdir "generated"
	@protoc --go_out=./generated --go_opt=paths=source_relative \
    --go-grpc_out=./generated --go-grpc_opt=paths=source_relative \
	--proto_path=../common/protos \
	../common/protos/products.proto \
	../common/protos/auth.proto \
	../common/protos/redis.proto \
	../common/protos/users.proto \
	../common/protos/shared.proto \
	../common/protos/orders.proto \