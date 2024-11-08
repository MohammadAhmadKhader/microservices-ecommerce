import { Observable, lastValueFrom } from "rxjs";

export type ObservableService<T> = {
    [K in keyof T]: T[K] extends (...args: infer TArgs) => Promise<infer TResult>
      ? (...args: TArgs) => Observable<Promise<TResult>>
      : T[K];
};

export async function handleObservable<TService>(obsFunc : Observable<Promise<TService>>) {
    const obsFunc$ = await lastValueFrom(obsFunc)
    return obsFunc$
}