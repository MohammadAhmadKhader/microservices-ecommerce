.PHONY: protos generate

protos:
	bash -c "mkdir -p ./dist/protos ./protos" && \
	bash -c "cp -r ../../protos/*.proto ./dist/protos/" && \
	bash -c "cp -r ../../protos/*.proto ./protos/"


SHELL := cmd.exe
generate:
	@IF EXIST "generated" rmdir /s /q "generated"
	@mkdir "generated"
	@protoc --plugin=protoc-gen-ts_proto.cmd --ts_proto_out=./generated \
	--ts_proto_opt=nextjs=true -I=../../protos/ \
	../../protos/health.proto \
	../../protos/products.proto \
	../../protos/orders.proto \
	../../protos/shared.proto \
	../../protos/users.proto \
	../../protos/redis.proto \
	../../protos/auth.proto \