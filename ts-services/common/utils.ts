import { Metadata } from '@grpc/grpc-js';
import { Timestamp } from 'google-protobuf/google/protobuf/timestamp_pb';
import { Observable, lastValueFrom } from "rxjs";
import {context, trace} from "@opentelemetry/api"
import { ServerWritableStreamImpl } from '@grpc/grpc-js/build/src/server-call';

export function toProtobufTimestamp(date: Date): any {
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

/**
 * @deprecated
 */
export function extractMetadataFromArgs(target:string, propertyKey:string, args: any[]) {
    let metadata: Metadata

    args.forEach((type, index) => {
        if(type?.name === "Metadata") {
            metadata = args[index]
            console.log(metadata)
       }
    });

    return metadata
}

/**
 * @deprecated
 */
export function extractTraceParent(target:string, propertyKey:string,...args: any[]) {
    const metadata = extractMetadataFromArgs(target, propertyKey, args)
    return metadata?.get('traceparent')?.[0];
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