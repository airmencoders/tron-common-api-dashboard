import { formatBytesToString } from '../file-utils';

describe('File Utils Test', () => {
  it('should return formatted string from number of bytes', () => {
    expect(formatBytesToString(1024)).toEqual('1 KB');
    expect(formatBytesToString(Math.pow(1024, 2))).toEqual('1 MB');
    expect(formatBytesToString(Math.pow(1024, 3))).toEqual('1 GB');
    expect(formatBytesToString(Math.pow(1024, 4))).toEqual('1 TB');
    expect(formatBytesToString(Math.pow(1024, 5))).toEqual('1 PB');
    expect(formatBytesToString(Math.pow(1024, 6))).toEqual('1 EB');
    expect(formatBytesToString(Math.pow(1024, 7))).toEqual('1 ZB');
    expect(formatBytesToString(Math.pow(1024, 8))).toEqual('1 YB');
  });
});
