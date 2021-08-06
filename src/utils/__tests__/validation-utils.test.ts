import { getNullableFieldsFromSchema } from '../validation-utils';

describe('Validation Util Tests', () => {
  it('should extract all nullable string fields from JSON schema', () => {
    const schema = {
      address: {
        type: [
          'string',
          'null'
        ]
      },
      firstName: {
        type: [
          'string'
        ]
      },
      lastName: {
        type: [
          'string',
          'null'
        ]
      },
      branch: {
        $ref: 'model-types.json#/definitions/PersonDtoBranchEnum'
      },
      id: {
        type: 'string'
      },
    };

    const nullableFields = getNullableFieldsFromSchema(schema);
    const actualNullableFields = new Set(['address', 'lastName']);

    expect(nullableFields).toEqual(actualNullableFields);
  });
});