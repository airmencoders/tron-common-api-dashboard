import { createGenericAxiosRequestErrorResponse } from '../../TestUtils/test-utils';
import { prepareRequestError } from '../error-handling-utils';
import { RequestError } from '../request-error';

describe('User Info Service Tests', () => {
  it('should prepare response error', () => {
    const responseError = createGenericAxiosRequestErrorResponse();

    const requestError = {
      status: responseError.response.data.status,
      error: responseError.response.data.error,
      message: responseError.response.data.reason
    } as RequestError;

    const requestErrorToTest = prepareRequestError(responseError);

    expect(requestErrorToTest).toEqual(requestError);
  });

  it('should prepare request error', () => {
    const dataRequestError = {
      request: {

      }
    };

    const requestError = {
      message: 'Error contacting server. Try again later.'
    } as RequestError;

    const requestErrorToTest = prepareRequestError(dataRequestError);

    expect(requestErrorToTest).toEqual(requestError);
  });

  it('should prepare unknown error', () => {
    const dataRequestError = new Error('Failed');

    const requestError = {
      message: 'Failed'
    } as RequestError;

    const requestErrorToTest = prepareRequestError(dataRequestError);

    expect(requestErrorToTest).toEqual(requestError);
  });

  it('should prepare unknown object', () => {
    const dataRequestError = {};

    const requestError = {
      message: 'Unknown error occurred.'
    } as RequestError;

    const requestErrorToTest = prepareRequestError(dataRequestError);

    expect(requestErrorToTest).toEqual(requestError);
  });
});
