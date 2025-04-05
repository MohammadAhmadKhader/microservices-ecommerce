import { Timestamp } from 'google-protobuf/google/protobuf/timestamp_pb';
import { Observable, lastValueFrom } from "rxjs";
import { ServerWritableStreamImpl } from '@grpc/grpc-js/build/src/server-call';

export function toProtobufTimestamp(date: Date) {
    const timestamp = new Timestamp();

    const seconds = Math.floor(date.getTime() / 1000);
    const nanos = (date.getTime() % 1000) * 1000000;
    timestamp.setSeconds(seconds);
    timestamp.setNanos(nanos);

    return timestamp.toObject();
}

export async function handleObservable<TService>(obsFunc : Observable<Promise<TService>>) {
    const obsFunc$ = await lastValueFrom(obsFunc)
    return obsFunc$
}

export function getRandomInt(min:number, max:number){
    return Math.floor(Math.random() * (max - min + 1)) + min; 
}

export function getMethodAndServiceNameFromArgs(args: any[]) {
    const serviceWritableStreamImpl = args[2] as ServerWritableStreamImpl<any, any>
    const path = serviceWritableStreamImpl.getPath()
    const splittedPath = path.split("/")
    const methodName = splittedPath[splittedPath.length - 1]
    const serviceName = splittedPath[splittedPath.length - 2].split(".")[1]
  
    return {
      methodName,
      serviceName
    }
}

export function getServiceName(serviceWritableStreamImpl: ServerWritableStreamImpl<any, any>) {
  const path = serviceWritableStreamImpl.getPath()
  const splittedPath = path.split("/")
  const serviceName = splittedPath[splittedPath.length - 2].split(".")[1]
  return serviceName
}