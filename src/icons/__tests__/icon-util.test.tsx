import { getIconColorClassname } from '../icon-util';
import { IconStyleType } from '../IconStyleType';

describe('Icon Util Test', () => {
  test('Should get disabled class', () => {
    expect(getIconColorClassname(undefined, true)).toEqual('icon-disabled-color');
  });

  test('Should get default classname when style type is null or default', () => {
    expect(getIconColorClassname(undefined, false)).toEqual('');
    expect(getIconColorClassname('default', false, 'some-icon-color')).toEqual('some-icon-color');
  });

  test('Should get primary classname when style type is primary', () => {
    expect(getIconColorClassname('primary', false, 'some-icon-color')).toEqual('icon-color-primary');
  })

  test('Should get defaultClassname if match no condition', () => {
    expect(getIconColorClassname('bad' as IconStyleType, false, 'some-icon-color')).toEqual('some-icon-color');
    expect(getIconColorClassname('bad' as IconStyleType, false)).toEqual('');
  });
});