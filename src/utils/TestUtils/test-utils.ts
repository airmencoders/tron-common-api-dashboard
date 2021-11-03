import { AxiosResponse } from 'axios';

export function flushPromises() {
  return new Promise(resolve => setImmediate(resolve));
}

export function createGenericAxiosRequestErrorResponse(statusCode: number = 400) {
  return {
    response: {
      data: {
        reason: 'Generic Axios Request Failure',
        status: statusCode,
        error: 'Failed Request'
      },
      status: statusCode,
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

export function createAxiosNoContentResponse(): AxiosResponse<{}> {
  return {
    data: {},
    status: 204,
    statusText: 'OK',
    config: {},
    headers: {}
  };
}