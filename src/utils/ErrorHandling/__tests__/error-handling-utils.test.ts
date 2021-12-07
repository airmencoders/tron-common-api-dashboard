import { createGenericAxiosRequestErrorResponse } from '../../TestUtils/test-utils';
import { prepareRequestError } from '../error-handling-utils';
import RequestError from '../request-error';

describe('User Info Service Tests', () => {
  it('should prepare response error', () => {
    const responseError = createGenericAxiosRequestErrorResponse();

    const requestError = new RequestError({
      status: responseError.response.data.status,
      error: responseError.response.data.error,
      message: responseError.response.data.reason
    });

    const requestErrorToTest = prepareRequestError(responseError);

    expect(requestErrorToTest).toEqual(requestError);
  });

  it('should prepare request error', () => {
    const dataRequestError = {
      request: {

      }
    };

    const requestError = new RequestError({
      message: 'Error contacting server. Try again later.'
    })

    const requestErrorToTest = prepareRequestError(dataRequestError);

    expect(requestErrorToTest).toEqual(requestError);
  });

  it('should prepare unknown error', () => {
    const dataRequestError = new Error('Failed');

    const requestError = new RequestError({
      message: 'Failed'
    });

    const requestErrorToTest = prepareRequestError(dataRequestError);

    expect(requestErrorToTest).toEqual(requestError);
  });

  it('should prepare unknown object', () => {
    const dataRequestError = {};

    const requestError = new RequestError({
      message: 'Unknown error occurred.'
    });

    const requestErrorToTest = prepareRequestError(dataRequestError);

    expect(requestErrorToTest).toEqual(requestError);
  });
});
