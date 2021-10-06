import { render, screen, waitFor } from '@testing-library/react';
import ProductionIcon from '../ProductionIcon';

test('renders production icon', async () => {
  render(<ProductionIcon />);
  await waitFor(() => {
    expect(screen.getByTitle('production')).toBeTruthy();
  });
});
