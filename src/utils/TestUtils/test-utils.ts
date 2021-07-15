import { AxiosResponse } from 'axios';

export function flushPromises() {
  return new Promise(resolve => setImmediate(resolve));
}

export function createGenericAxiosRequestErrorResponse() {
  return {
    response: {
      data: {
        reason: 'Generic Axios Request Failure',
        status: 400,
        error: 'Failed Request'
      },
      status: 400,
      statusText: 'Failed Request',
      config: {},
      headers: {}
    }
  };
}

export function createAxiosSuccessResponse<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: 'OK',
    config: {},
    headers: {}
  };
}