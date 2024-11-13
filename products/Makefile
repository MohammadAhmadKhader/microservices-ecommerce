gen-commons:
	robocopy ..\common\common-ts .\src\common-ts *.ts /E /XD node_modules

generate:
	@IF EXIST "generated" rmdir /s /q "generated"
	@mkdir "generated"
	@protoc --plugin=protoc-gen-ts_proto.cmd --ts_proto_out=./generated \
	--ts_proto_opt=nextjs=true -I=../common/protos/ \
	../common/protos/products.proto \
	../common/protos/shared.proto \
	../common/protos/health.proto 