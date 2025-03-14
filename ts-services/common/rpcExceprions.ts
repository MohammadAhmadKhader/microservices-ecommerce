import { status } from "@grpc/grpc-js";
import { RpcException } from "@nestjs/microservices";


export class RpcInvalidArgumentException extends RpcException {
    constructor(message: string) {
        super({code: status.INVALID_ARGUMENT, message})
    }
}

export class RpcInternalException extends RpcException {
    constructor(message: string) {
        super({code: status.INTERNAL, message})
    }
}

/**
 * This is used when the resource itself not found and not whole the endpoint like 404 in http
 */
export class RpcNotFoundException extends RpcException {
    constructor(message: string) {
        super({code: status.NOT_FOUND, message})
    }
}

export class RpcForbiddenException extends RpcException {
    constructor(message: string) {
        super({code: status.PERMISSION_DENIED, message})
    }
}

export class RpcUnauthorizedException extends RpcException {
    constructor(message: string) {
        super({code: status.UNAUTHENTICATED, message})
    }
}

export class RpcAlreadyExistsException extends RpcException {
    constructor(message: string) {
        super({code: status.ALREADY_EXISTS, message})
    }
}

export class RpcFailedPreConditionException extends RpcException {
    constructor(message: string) {
        super({code: status.FAILED_PRECONDITION, message})
    }
}