import { render, screen, waitFor } from '@testing-library/react';
import DownloadIcon from '../DownloadIcon';

test('renders download icon', async () => {
  render(<DownloadIcon size={20} />);
  await waitFor(() => {
    expect(screen.getByTitle('download')).toBeTruthy();
  });
});
