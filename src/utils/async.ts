import { CancellationToken, CancellationTokenSource } from './cancellation';
import { CancellationError } from './errors';


export interface CancelablePromise<T> extends Promise<T> {
  cancel(): void;
}
export function createCancelablePromise<T>(callback: (token: CancellationToken) => Promise<T>): CancelablePromise<T> {
  const source = new CancellationTokenSource()

  const thenable = callback(source.token)
  const promise = new Promise<T>((resolve, reject) => {
    const subscription = source.token.onCancellationRequested(() => {
      subscription.dispose()
      source.dispose()
      reject(new CancellationError())
    })

    Promise.resolve(thenable).then(value => {
      subscription.dispose()
      source.dispose()
      resolve(value)
    }).catch(err => {
      subscription.dispose()
      source.dispose()
      reject(err)
    })
  })
  return <CancelablePromise<T>>new class {
    cancel() {
      source.cancel()
    }
    then<TResult1 = T, TResult2 = never>(resolve?: ((value: T) => TResult1 | Promise<TResult1>) | undefined | null, reject?: ((reason: any) => TResult2 | Promise<TResult2>) | undefined | null): Promise<TResult1 | TResult2> {
      return promise.then(resolve, reject);
    }
    catch<TResult = never>(reject?: ((reason: any) => TResult | Promise<TResult>) | undefined | null): Promise<T | TResult> {
      return this.then(undefined, reject);
    }
    finally(onfinally?: (() => void) | undefined | null): Promise<T> {
      return promise.finally(onfinally);
    }
  }
}

export interface ITask<T> {
  (): T;
}
export class Throttler {

  private activePromise: Promise<any> | null;
  private queuedPromise: Promise<any> | null;
  private queuedPromiseFactory: ITask<Promise<any>> | null;

  constructor() {
    this.activePromise = null;
    this.queuedPromise = null;
    this.queuedPromiseFactory = null;
  }

  queue<T>(promiseFactory: ITask<Promise<T>>): Promise<T> {
    if (this.activePromise) {
      this.queuedPromiseFactory = promiseFactory;

      if (!this.queuedPromise) {
        const onComplete = () => {
          this.queuedPromise = null;

          const result = this.queue(this.queuedPromiseFactory!);
          this.queuedPromiseFactory = null;

          return result;
        };

        this.queuedPromise = this.activePromise!.then(onComplete, onComplete)
      }
      return this.queuedPromise
    }
    this.activePromise = promiseFactory();

    return new Promise((resolve, reject) => {
      this.activePromise!.then((result: T) => {
        this.activePromise = null;
        resolve(result);
      }, (err: unknown) => {
        this.activePromise = null;
        reject(err);
      });
    });
  }
}

export function timeout(millis: number): CancelablePromise<void>;
export function timeout(millis: number, token: CancellationToken): Promise<void>;
export function timeout(millis: number, token?: CancellationToken): CancelablePromise<void> | Promise<void> {
  if (!token) {
    return createCancelablePromise(token => timeout(millis, token))
  }
  return new Promise((resolve, reject) => {
    const handle = setTimeout(() => {
      disposable.dispose()
      resolve()
    }, millis)
    const disposable = token.onCancellationRequested(() => {
      clearTimeout(handle)
      disposable.dispose()
      reject(new CancellationError())
    })
  })
}
