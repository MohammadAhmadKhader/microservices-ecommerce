gen-commons:
	xcopy /E /I /Y ..\\common\\common-ts\\*.ts .\\src\\common-ts\\ \
	&& IF EXIST .\\src\\common-ts\\node_modules (rd /S /Q .\\src\\common-ts\\node_modules)

generate:
	@IF NOT EXIST "generated" mkdir "generated"
	@protoc --plugin=protoc-gen-ts_proto.cmd --ts_proto_out=./generated \
	--ts_proto_opt=nextjs=true -I=../common/protos/ \
	../common/protos/users.proto \
	../common/protos/shared.proto 