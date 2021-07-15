import { RequestError } from "./request-error";

export function prepareRequestError(err: any): RequestError {
  if (err.response) { // Server responded with some error (4xx, 5xx)
    return {
      status: err.response.data.status,
      error: err.response.data.error,
      message: err.response.data.reason
    };
  } else if (err.request) { // Request never left
    return {
      message: 'Error contacting server. Try again later.'
    }
  } else { // Something else happened...
    return {
      message: err.message ?? 'Unknown error occurred.'
    }
  }
}