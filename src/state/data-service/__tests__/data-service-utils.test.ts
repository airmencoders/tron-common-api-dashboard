import { DataCrudFormErrors } from "../../../components/DataCrudFormPage/data-crud-form-errors";
import { prepareDataCrudErrorResponse } from "../data-service-utils";

describe('Data Service Utils Test', () => {
  const axiosRejectResponse = {
    response: {
      data: {
        errors: [
          {
            field: 'name',
            defaultMessage: 'cannot be blank'
          }
        ],
        message: 'failed'
      },
      status: 400,
      statusText: 'OK',
      config: {},
      headers: {}
    }
  };

  const axiosRejectRequest = {
    request: {
      data: {
        message: 'failed'
      },
      status: 400,
      statusText: 'OK',
      config: {},
      headers: {}
    }
  };

  it('Test prepareDataCrudErrorResponse -- response', () => {
    const errorResponse = prepareDataCrudErrorResponse(axiosRejectResponse);
    const answer = {
      validation: {
        name: axiosRejectResponse.response.data.errors[0].defaultMessage
      },
      general: axiosRejectResponse.response.data.message
    } as DataCrudFormErrors;

    expect(errorResponse).toEqual(answer);
  });

  it('Test prepareDataCrudErrorResponse -- request', () => {
    const errorResponse = prepareDataCrudErrorResponse(axiosRejectRequest);
    const answer = {
      general: 'Error contacting server. Try again later.'
    } as DataCrudFormErrors;

    expect(errorResponse).toEqual(answer);
  });

  it('Test prepareDataCrudErrorResponse -- unknown', () => {
    const errorResponse = prepareDataCrudErrorResponse(new Error('failed'));
    const answer = {
      general: 'failed'
    } as DataCrudFormErrors;

    expect(errorResponse).toEqual(answer);
  });

  it('Test prepareDataCrudErrorResponse -- bad input', () => {
    const errorResponse = prepareDataCrudErrorResponse('asdf');
    const answer = {
      general: 'Unknown error occurred.'
    } as DataCrudFormErrors;

    expect(errorResponse).toEqual(answer);
  });
});