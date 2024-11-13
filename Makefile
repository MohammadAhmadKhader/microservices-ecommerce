generate-protos:
	@cd products && make generate
	@cd orders && make generate
	@cd gateway && make generate
	@cd redis && make generate
	@cd users && make generate
	@cd auth && make generate
	@cd common/common-ts && make generate

run:
	bash ./start.sh