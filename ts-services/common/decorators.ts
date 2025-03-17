import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RpcInvalidArgumentException } from './rpcExceprions';

export function ValidateGrpcPayload(dtoClass: any) {
  return function (target: any, methodName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const [data] = args;
      const object = plainToInstance(dtoClass, data);
      const errors = await validate(object);
      
      if (errors.length > 0) {
        const firstErrMsg = Object.values(errors[0].constraints).join(", ")
        throw new RpcInvalidArgumentException(firstErrMsg)
      }

      return originalMethod.apply(this, args);
    };
  };
}