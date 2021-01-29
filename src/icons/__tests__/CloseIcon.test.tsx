import React from 'react';
import {render, screen, waitFor} from '@testing-library/react';
import CloseIcon from '../CloseIcon';

test('CloseIcon appears', async () => {
  render(<CloseIcon size={4} />);
  await waitFor(
      () => expect(screen.getByTitle('close')).toBeTruthy()
  );
});
