.PHONY: protos run-cli

protos:
	bash -c "mkdir -p ./src/protos" && \
	bash -c "cp -r ../../protos/*.proto ./src/protos/"

run-prod:
	npm run start

run-dev:
	npm run start:dev

run-cli:
	npm run cli $(ARGS)