import { getNullableFieldsFromSchema, validateDocSpaceName, validateFolderName } from '../validation-utils';

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

  it('should validate space names', () => {
    expect(validateDocSpaceName('Test')).toBeFalsy();
    expect(validateDocSpaceName('')).toBeFalsy();
    expect(validateDocSpaceName('test/folder')).toBeFalsy();
    expect(validateDocSpaceName('.metadata')).toBeFalsy();

    expect(validateDocSpaceName('test')).toBeTruthy();
    expect(validateDocSpaceName('test-folder')).toBeTruthy();
    expect(validateDocSpaceName('test-folder123.tron')).toBeTruthy();
    expect(validateDocSpaceName('89.metadata')).toBeTruthy();
    
  });

  it('should validate folder/file names', () => {
    expect(validateFolderName('Test')).toBeTruthy();
    expect(validateFolderName('')).toBeFalsy();
    expect(validateFolderName('test/folder')).toBeFalsy();
    expect(validateFolderName('.metadata')).toBeTruthy();

    expect(validateFolderName('test')).toBeTruthy();
    expect(validateFolderName('test-folder')).toBeTruthy();
    expect(validateFolderName('test-folder123.tron')).toBeTruthy();
    expect(validateFolderName('89.metadata')).toBeTruthy();
    expect(validateFolderName('89_meta data')).toBeTruthy();
    
  });
});
