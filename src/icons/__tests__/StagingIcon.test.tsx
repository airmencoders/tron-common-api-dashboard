import { render, screen, waitFor } from '@testing-library/react';
import StagingIcon from '../StagingIcon';

test('renders staging icon', async () => {
  render(<StagingIcon />);
  await waitFor(() => {
    expect(screen.getByTitle('staging')).toBeTruthy();
  });
});
