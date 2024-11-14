generate-protos:
	@cd ts-services/common && make generate
	@cd golang-services/common && make generate

run-dev:
	bash ./start-dev.sh

run-prod:
	bash ./start-prod.sh

run-ts:
	nest start auth redis users 