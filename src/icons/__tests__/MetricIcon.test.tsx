import { render, screen, waitFor } from '@testing-library/react';
import MetricIcon from '../MetricIcon';

test('renders metric icon', async () => {
  render(<MetricIcon size={20} />);
  await waitFor(() => {
    expect(screen.getByTitle('metric')).toBeTruthy();
  });
});
