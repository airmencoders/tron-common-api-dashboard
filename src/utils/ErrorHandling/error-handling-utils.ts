import RequestError from './request-error';

export function prepareRequestError(err: any): RequestError {
  if (err instanceof RequestError) {
    return err;
  }

  if (err.response) { // Server responded with some error (4xx, 5xx)
    return new RequestError({
      status: err.response.data.status,
      error: err.response.data.error,
      message: err.response.data.reason
    });
  } else if (err.request) { // Request never left
    return new RequestError({
      message: 'Error contacting server. Try again later.'
    });
  } else { // Something else happened...
    return new RequestError({
      message: err.message ?? 'Unknown error occurred.'
    });
  }
}