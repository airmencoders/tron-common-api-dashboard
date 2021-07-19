import {render, waitFor, screen} from '@testing-library/react';
import CopyToClipboard from '../CopyToClipboard';

describe('Copy to Clipboard', () => {
  it('Renders correctly', async () => {
    render(
        <CopyToClipboard text="Clipboard Text" />
    );

    await waitFor(
        () => expect(screen.getByTestId('copy-to-clipboard-component')).toBeTruthy()
    );
  });
});
