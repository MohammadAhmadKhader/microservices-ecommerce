protos:
	bash -c "mkdir -p ./src/protos" && \
	bash -c "cp -r ../../protos/*.proto ./src/protos/"

run-prod:
	npm run start

run-dev:
	npm run start:dev $(MAKECMDGOALS)

run-cli:
	node ./dist/main.js $(MAKECMDGOALS)