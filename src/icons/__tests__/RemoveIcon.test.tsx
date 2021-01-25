import React from 'react';
import {render, waitFor, screen} from '@testing-library/react';
import RemoveIcon from '../RemoveIcon';

test('renders remove icon', async () => {
  render(<RemoveIcon size={20} />);
  await waitFor(() => {
    expect(screen.getByTitle('remove')).toBeTruthy();
  });
});
