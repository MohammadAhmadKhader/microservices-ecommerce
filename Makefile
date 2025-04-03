generate-protos:
	@cd ts-services/common && make generate
	@cd golang-services/common && make generate
	@cd ts-services/common && make protos
	@cd ts-services/auth && make protos
	@cd ts-services/products && make protos
	@cd ts-services/redis && make protos

run-dev:
	bash ./start-dev.sh

run-prod:
	bash ./start-prod.sh

# run-ts:
# 	nest start auth redis users

build:
	@cd ts-services/redis && npm i
	@cd ts-services/common && npm i
	@cd ts-services/products && npm i
	@cd ts-services/auth && npm i

tidy:
	cd golang-services/orders && go mod tidy
	cd golang-services/gateway && go mod tidy
	cd golang-services/common && go mod tidy