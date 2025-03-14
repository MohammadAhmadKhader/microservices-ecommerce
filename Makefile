generate-protos:
	@cd ts-services/common && make generate
	@cd golang-services/common && make generate

run-dev:
	bash ./start-dev.sh

run-prod:
	bash ./start-prod.sh

# run-ts:
# 	nest start auth redis users

build:
	@cd ts-services/users && npm i
	@cd ts-services/redis && npm i
	@cd ts-services/common && npm i
	@cd ts-services/products && npm i
	@cd ts-services/auth && npm i