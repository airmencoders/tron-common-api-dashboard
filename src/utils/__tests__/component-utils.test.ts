import { performActionWhenMounted } from '../component-utils';

describe('Test Component Utils', () => {
  it('should perform action when mounted', () => {
    const mockFunc = jest.fn();

    performActionWhenMounted(true, mockFunc);

    expect(mockFunc).toHaveBeenCalled();
  });

  it('should not perform action when not mounted', () => {
    const mockFunc = jest.fn();

    performActionWhenMounted(false, mockFunc);

    expect(mockFunc).not.toHaveBeenCalled();
  });
});
