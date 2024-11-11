generate:
	@IF EXIST "generated" rmdir /s /q "generated"
	@mkdir "generated"
	@protoc --plugin=protoc-gen-ts_proto.cmd --ts_proto_out=./generated \
	--ts_proto_opt=nextjs=true -I=../protos/ \
	../protos/health.proto 