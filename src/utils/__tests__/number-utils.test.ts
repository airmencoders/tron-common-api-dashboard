import {setSignificantDigits} from '../number-utils';

describe('Number Utils Tests', () => {
  it('should set the significant digits for a number', () => {
    const startValue = 12.22221;
    const converted = setSignificantDigits(startValue, 2);
    expect(converted).toEqual(12.22);
  })
})
