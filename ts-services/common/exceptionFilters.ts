import { ArgumentsHost, Catch, RpcExceptionFilter } from "@nestjs/common";
import { status } from "@grpc/grpc-js";
import { Observable, throwError } from "rxjs";
import { RpcException } from "@nestjs/microservices";

@Catch(Error)
export class GenericExceptionFilter implements RpcExceptionFilter<Error> {
  catch(exception: Error, host: ArgumentsHost): Observable<any> {
    if (exception instanceof RpcException) {
        return throwError(() => exception.getError());
    }

    console.log(exception.stack)
    console.log(exception.message)

    const genericGrpcError = {
      code: status.INTERNAL,
      message: "Internal server error",
    };

    return throwError(() => genericGrpcError);
  }
}