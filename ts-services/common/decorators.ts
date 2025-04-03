import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RpcInvalidArgumentException } from './rpcExceprions';
import { TimestampsMode } from './types';
import { createdAtConverter, createdUpdatedAtArrayConverter,
   createdUpdatedAtConverter, updatedAtArrayConverter, updatedAtConverter } from './utils';

export function ValidateGrpcPayload(dtoClass: any) {
  return function (target: any, methodName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const [data] = args;
      const object = plainToInstance(dtoClass, data);
      const errors = await validate(object);
      
      if (errors.length > 0) {
        let firstErrMsg: string = ""
        if(errors[0].constraints) {
          firstErrMsg = Object.values(errors[0].constraints).join(", ")
        } else if(errors[0].children?.[0]?.constraints) {

          firstErrMsg = Object.values(errors[0].children[0].constraints).join(", ")
        } else if(errors[0].contexts?.[0]?.constraints) {

          firstErrMsg = Object.values(errors[0].contexts[0].constraints).join(", ")
        } else {
          firstErrMsg = "Unknown error"
        }
        
        throw new RpcInvalidArgumentException(firstErrMsg)
      }

      return originalMethod.apply(this, args);
    };
  };
}

/**
 * This decorator will convert normal timestamps to google timestamps by providing the 
 * path of the object that contains fields 'updatedAt' and/or 'createdAt depending on the given mode
 */
export function ConvertTimeStamps(path: string, mode: TimestampsMode ,isArray = false) {
  return function (target: any, methodName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
    
      const result = await originalMethod.apply(this, args);
      if(mode === "both" && isArray) {
        const converted = createdUpdatedAtArrayConverter(result[path])
        result[path] = converted
        return result

      } else if (mode === "both" && !isArray) {
        createdUpdatedAtConverter(result[path])
        
      } else if (mode === "createdAt" && isArray) {
        const converted = createdUpdatedAtArrayConverter(result[path])
        result[path] = converted
        return result

      } else if (mode === "createdAt" && !isArray) {
        createdAtConverter(result[path])
      } else if (mode === "updatedAt" && isArray) {
        const converted = updatedAtArrayConverter(result[path])
        result[path] = converted
        return result

      } else if (mode === "updatedAt" && !isArray) {
        updatedAtConverter(result[path])
      }

      return result
    };
  };
}