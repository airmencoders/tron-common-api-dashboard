import React from 'react';
import {render, screen, waitFor} from '@testing-library/react';
import PageTitle from '../PageTitle';

test('shows the page title', async () => {
  render(<PageTitle title="The Page Title" />);
  await waitFor(() => screen.getByText("The Page Title"));
  const pageTitleEl = screen.getByText("The Page Title");
  expect(pageTitleEl).toBeTruthy();
});
