import React from 'react';
import {render, screen, waitFor} from '@testing-library/react';
import StatusGoodIcon from '../StatusGoodIcon';

test('renders status good icon', async () => {
  render(<StatusGoodIcon size={20} />);
  await waitFor(() => {
    expect(screen.getByTitle('status-good')).toBeTruthy();
  });
});
