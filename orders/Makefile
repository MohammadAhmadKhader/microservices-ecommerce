generate:
	@IF NOT EXIST "generated" mkdir "generated"
	@protoc --go_out=./generated --go_opt=paths=source_relative \
    --go-grpc_out=./generated --go-grpc_opt=paths=source_relative \
	--proto_path =../common/protos \
    ../common/protos/products.proto \
	../common/protos/orders.proto \
	../common/protos/shared.proto 

run:
	@go run ./main.go