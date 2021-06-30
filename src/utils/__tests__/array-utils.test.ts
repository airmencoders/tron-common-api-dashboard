import React from 'react';
import {combineArraysByKey} from '../array-utils';

describe('combineArraysByKeys', () => {
  type TestType = {
    val: string,
    key: string
  };
  const array1: Array<TestType> = [
    { key: 'key1', val: 'val1' },
    { key: 'key2', val: 'val2' },
    { key: 'key3', val: 'val3' },
    { key: 'key4', val: 'val4_1' },
  ];
  const array2: Array<TestType> = [
    { key: 'key3', val: 'val3' },
    { key: 'key4', val: 'val4_2' },
    { key: 'key5', val: 'val5' },
    { key: 'key6', val: 'val6' },
  ];
  it('should combine arrays of the same type', () => {
    const result = combineArraysByKey([array1, array2],
        (item) => item.key, true);
    expect(result.length).toEqual(6);
  });

  it ('should keep first val for duplicated key if flagged', () => {
    const result = combineArraysByKey([array1, array2],
        (item) => item.key, true);
    const dupItem = result.find((item) => item.key === 'key4');
    expect(dupItem?.val).toEqual('val4_1');
  });

  it ('should keep last val for duplicated key if flagged', () => {
    const result = combineArraysByKey([array1, array2],
        (item) => item.key, false);
    const dupItem = result.find((item) => item.key === 'key4');
    expect(dupItem?.val).toEqual('val4_2');
  });

  it ('should skip concat if array undefined', () => {
    const result = combineArraysByKey([undefined, array2],
        (item) => item.key, false);
    const dupItem = result.find((item) => item.key === 'key4');
    expect(dupItem?.val).toEqual('val4_2');
  });
});
