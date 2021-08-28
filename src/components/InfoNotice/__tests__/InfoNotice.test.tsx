import React from 'react';
import InfoNotice from '../InfoNotice';
import {render, screen, waitFor} from '@testing-library/react';

describe('Test InfoNotice', () => {

  test('show the InfoNotice', async () => {
    render(<InfoNotice type="info">Test Notice</InfoNotice>);
    await waitFor(() => {
      expect(screen.getByText('Test Notice')).toBeTruthy()
    })
  })
  test('show the InfoNotice Header', async () => {
    render(<InfoNotice type="info"
                       heading={<>Heading</>}
    >Test Notice</InfoNotice>);
    await waitFor(() => {
      expect(screen.getByText('Heading')).toBeTruthy()
    })
  })
})
