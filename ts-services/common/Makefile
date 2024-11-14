generate:
	@IF EXIST "generated" rmdir /s /q "generated"
	@mkdir "generated"
	@protoc --plugin=protoc-gen-ts_proto.cmd --ts_proto_out=./generated \
	--ts_proto_opt=nextjs=true -I=../../common/protos/ \
	../../common/protos/health.proto \
	../../common/protos/products.proto \
	../../common/protos/orders.proto \
	../../common/protos/shared.proto \
	../../common/protos/users.proto \
	../../common/protos/redis.proto \
	../../common/protos/auth.proto \