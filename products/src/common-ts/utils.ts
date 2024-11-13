import { Timestamp } from 'google-protobuf/google/protobuf/timestamp_pb';

export function toProtobufTimestamp(date: Date): any {
    const timestamp = new Timestamp();

    const seconds = Math.floor(date.getTime() / 1000);
    const nanos = (date.getTime() % 1000) * 1000000;
    timestamp.setSeconds(seconds);
    timestamp.setNanos(nanos);

    return timestamp.toObject();
}

export function getRandomInt(min:number, max:number){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}