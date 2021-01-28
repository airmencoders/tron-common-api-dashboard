import React from 'react';
import {render, screen, waitFor} from '@testing-library/react';
import WarningIcon from '../WarningIcon';

test('WarningIcon appears', async () => {
  render(<WarningIcon size={4} />);
  await waitFor(
      () => expect(screen.getByTitle('warning')).toBeTruthy()
  );
});
