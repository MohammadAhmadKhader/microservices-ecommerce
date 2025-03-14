## Requirements
Make sure you have the following installed so generating protofbuf code works as expected:

- Go
- Node.js & npm
- Protobuf Compiler (`protoc`)
- make

## Install Requirements

### Go Dependencies
```sh
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@late
```

### NPM Dependencies
```
npm install -g ts-proto
```
### Protobuf Compiler
Download and install protoc from:
https://github.com/protocolbuffers/protobuf/releases

### Make
Download and install make from:
https://gnuwin32.sourceforge.net/packages/make.htm