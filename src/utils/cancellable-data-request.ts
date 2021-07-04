import axios, { AxiosPromise, CancelTokenSource } from 'axios';

/**
 * @member axiosPromise the axios promise
 * @member cancelTokenSource axios cancel token source
 */
export interface CancellableDataRequest<T> {
  axiosPromise: AxiosPromise<T>;
  cancelTokenSource: CancelTokenSource;
}

/**
 * 
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
 * 
 * @param request a function that generates the {@link axios} request. Typically will be an api function request generated from openapi generator
 * @param axiosRequestOptions an object containing {@link axios} request options
 * @returns the axios request and its associated cancel token
 */
export function makeCancellableDataRequest<T>(request: (options: any) => AxiosPromise<T>, axiosRequestOptions: any): CancellableDataRequest<T> {
  const requestOptions: any = { ...axiosRequestOptions };

  const cancelToken = axios.CancelToken;
  const source = cancelToken.source();
  requestOptions['cancelToken'] = source.token;

  return {
    axiosPromise: request(requestOptions),
    cancelTokenSource: source
  }
}