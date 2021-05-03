import { CheckboxStatusType } from "../checkbox-status-type";
import { generateCheckboxTitle } from "../checkbox-utils";

describe('Checkbox Utility Tests', () => {
  it('it should return string value of boolean', () => {
    expect(generateCheckboxTitle(true)).toEqual('true');
    expect(generateCheckboxTitle(false)).toEqual('false');
  });

  it('it should return string value of CheckboxStatusType', () => {
    expect(generateCheckboxTitle(CheckboxStatusType.CHECKED)).toEqual('true');
    expect(generateCheckboxTitle(CheckboxStatusType.UNCHECKED)).toEqual('false');
    expect(generateCheckboxTitle(CheckboxStatusType.INDETERMINATE)).toEqual('indeterminate');
  });
})