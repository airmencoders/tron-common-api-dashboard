import { DataCrudFormErrors } from "../../../components/DataCrudFormPage/data-crud-form-errors";
import { JsonPatchStringValueOpEnum } from '../../../openapi';
import { createJsonPatchOp, getDataItemDuplicates, getDataItemNonDuplicates, mapDataItemsToStringIds, prepareDataCrudErrorResponse } from "../data-service-utils";

describe('Data Service Utils Test', () => {
  const axiosRejectResponse = {
    response: {
      data: {
        errors: [
          {
            fieldName: 'name',
            defaultMessage: 'cannot be blank'
          }
        ],
        reason: 'failed'
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
      general: 'Form Validation failed. Error count: 1'
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

  it('Should throw when performing non-supported json patch operations', () => {
    expect(() => createJsonPatchOp(JsonPatchStringValueOpEnum.Copy, '/', 'asdf')).toThrow();
    expect(() => createJsonPatchOp(JsonPatchStringValueOpEnum.Move, '/', 'asdf')).toThrow();
  });

  it('Should return json patch operation for remove', () => {
    const op = createJsonPatchOp(JsonPatchStringValueOpEnum.Remove, '/');

    expect(op).toEqual({
      op: JsonPatchStringValueOpEnum.Remove,
      path: '/'
    });
  });

  it('Should return json patch operation for add, replace, test', () => {
    let op = createJsonPatchOp(JsonPatchStringValueOpEnum.Add, '/test', 'asdf');

    expect(op).toEqual({
      op: JsonPatchStringValueOpEnum.Add,
      path: '/test',
      value: 'asdf'
    });

    op = createJsonPatchOp(JsonPatchStringValueOpEnum.Replace, '/test', 'asdf');
    expect(op).toEqual({
      op: JsonPatchStringValueOpEnum.Replace,
      path: '/test',
      value: 'asdf'
    });

    op = createJsonPatchOp(JsonPatchStringValueOpEnum.Test, '/test', 'asdf');
    expect(op).toEqual({
      op: JsonPatchStringValueOpEnum.Test,
      path: '/test',
      value: 'asdf'
    });
  });

  it('Should throw error for json patch operation when not supplying correct parameters', () => {
    expect(() => createJsonPatchOp(JsonPatchStringValueOpEnum.Replace, '/')).toThrow();
  });

  it('Should return array of string ids only given array of data objects', () => {
    const items = [
      {
        id: 1,
        name: 'test'
      },
      {
        id: 2,
        name: 'test'
      },
      {
        id: 3,
        name: 'test'
      }
    ];

    const stringIds = mapDataItemsToStringIds(items);

    expect(stringIds).toContain('1');
    expect(stringIds).toContain('2');
    expect(stringIds).toContain('3');
  });

  it('Should return array of string ids that are duplicates', () => {
    const original = [
      {
        id: 1,
        name: 'test'
      },
      {
        id: 2,
        name: 'test'
      }
    ];

    const toCheck = [
      {
        id: 1,
        name: 'test'
      },
      {
        id: 2,
        name: 'test'
      },
      {
        id: 3,
        name: 'test'
      }
    ];

    const stringIds = getDataItemDuplicates(original, toCheck);

    expect(stringIds).toContain('1');
    expect(stringIds).toContain('2');
    expect(stringIds).not.toContain('3');
  });

  it('Should return array of string ids that are not duplicates', () => {
    const original = [
      {
        id: 1,
        name: 'test'
      },
      {
        id: 2,
        name: 'test'
      }
    ];

    const toCheck = [
      {
        id: 1,
        name: 'test'
      },
      {
        id: 2,
        name: 'test'
      },
      {
        id: 3,
        name: 'test'
      }
    ];

    const stringIds = getDataItemNonDuplicates(original, toCheck);

    expect(stringIds).not.toContain('1');
    expect(stringIds).not.toContain('2');
    expect(stringIds).toContain('3');
  });

});