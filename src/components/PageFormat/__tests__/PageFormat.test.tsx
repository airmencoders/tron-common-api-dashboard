import React from 'react';
import {render, waitFor, screen} from '@testing-library/react';
import PageFormat from '../PageFormat';

test('includes child elements in page', async () => {
  render(<PageFormat>
           <div>Child Content</div>
         </PageFormat>);
  await waitFor(() => {
    expect(screen.getByText('Child Content')).toBeTruthy();
  })
});
