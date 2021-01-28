import React from 'react';
import {render, screen, waitFor} from '@testing-library/react';
import ModalTitle from '../ModalTitle';

test('ModalTitle is shown', async () => {
  render(<ModalTitle title="Modal Title" />);
  await waitFor(
      () => expect(screen.getByText('Modal Title'))
          .toBeTruthy()
  )
});
