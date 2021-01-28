import React from 'react';
import {render, screen, waitFor} from '@testing-library/react';
import Card from '../Card';

test('Card renders', async () => {
  render(<Card><div>Child</div></Card>);
  await waitFor(
      () => expect(screen.getByText('Child')).toBeTruthy()
  );
});
