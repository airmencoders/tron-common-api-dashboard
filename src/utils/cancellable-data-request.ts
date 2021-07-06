import axios, { AxiosPromise, CancelTokenSource } from 'axios';

/**
 * @member axiosPromise the axios promise
 * @member cancelTokenSource axios cancel token source
 */
export interface CancellableAxiosDataRequest<T> {
  axiosPromise: () => AxiosPromise<T>;
  cancelTokenSource: CancelTokenSource;
}

export interface CancellableDataRequest<T> {
  promise: Promise<T>,
  cancelTokenSource: CancelTokenSource
}

/**
 * Checks if the given {@link error} is an {@link axios} cancel exception
 * 
 * @param error the error to check against
 * @returns true if the error is an Axios cancel exception
 */
export function isDataRequestCancelError(error: any) {
  return axios.isCancel(error);
}

/**
 * A function used to wrap an {@link axios} request generated from openapi generator to make it cancellable.
 * The cancel token will be automatically generated.
 * 
 * @param request a function that generates the {@link axios} request. Typically will be an api function request generated from openapi generator
 * @param axiosRequestOptions an object containing {@link axios} request options
 * @returns the axios request and its associated cancel token
 */
export function makeCancellableDataRequestToken<T>(request: (options: any) => AxiosPromise<T>, axiosRequestOptions?: any): CancellableAxiosDataRequest<T> {
  const cancelToken = axios.CancelToken.source();

  return makeCancellableDataRequest(cancelToken, request, axiosRequestOptions);
}

/**
 * A function used to wrap an {@link axios} request generated from openapi generator to make it cancellable.
 * The cancel token must be provided.
 * 
 * @param request a function that generates the {@link axios} request. Typically will be an api function request generated from openapi generator
 * @param axiosRequestOptions an object containing {@link axios} request options
 * @returns the axios request and its associated cancel token
 */
export function makeCancellableDataRequest<T>(cancelTokenSource: CancelTokenSource, request: (options: any) => AxiosPromise<T>, axiosRequestOptions?: any,): CancellableAxiosDataRequest<T> {
  const requestOptions: any = { ...axiosRequestOptions };

  requestOptions['cancelToken'] = cancelTokenSource.token;

  return {
    axiosPromise: () => request(requestOptions),
    cancelTokenSource: cancelTokenSource
  }
}
