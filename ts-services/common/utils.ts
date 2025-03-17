import { Metadata } from '@grpc/grpc-js';
import { Timestamp } from 'google-protobuf/google/protobuf/timestamp_pb';
import { Observable, lastValueFrom } from "rxjs";
import {context, trace} from "@opentelemetry/api"

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

export function extractTraceParent(target:string, propertyKey:string,...args: any[]) {
    const metadata = extractMetadataFromArgs(target, propertyKey, args)
    return metadata?.get('traceparent')?.[0];
}

