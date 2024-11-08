import { Timestamp } from 'google-protobuf/google/protobuf/timestamp_pb';

// Function to convert JavaScript Date to Protobuf Timestamp
export function toProtobufTimestamp(date: Date): any {
    const timestamp = new Timestamp();

    const seconds = Math.floor(date.getTime() / 1000);
    const nanos = (date.getTime() % 1000) * 1000000;
    timestamp.setSeconds(seconds);
    timestamp.setNanos(nanos);

    return timestamp.toObject();
}