export class CancellablePromise<T> {
  constructor(promise: Promise<T>,) {
    this._promise = new Promise<T>((resolve, reject) => {
      promise
        .then(val => {
          return this._shouldCancel ? reject({ isCanceled: true }) : resolve(val)
        })
        .catch(error => {
          return this._shouldCancel ? reject({ isCanceled: true }) : reject(error)
        })
        .finally(() => {
          this._isPromised = false;
        });
    });
  }

  private _shouldCancel = false;
  private _isPromised = true;
  private _promise;

  get promise(): Promise<T> {
    return this._promise;
  }

  cancel(): void {
    this._shouldCancel = true;
  }

  get isPromised() {
    return this._isPromised;
  }
}
