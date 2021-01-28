import React from 'react';
import {render, waitFor, screen} from '@testing-library/react';
import StatusCard from '../StatusCard';
import {StatusType} from '../status-type';

test('StatusCard appears', async () => {
  render(<StatusCard status={StatusType.GOOD} title="Status Card" />);
  await waitFor(
      () => expect(screen.getByText('Status Card')).toBeTruthy()
  );
});

test('StatusCard shows good icon if good', async () => {
  render(<StatusCard status={StatusType.GOOD} title="Status Card" />);
  await waitFor(
      () => expect(screen.getByTitle('good')).toBeTruthy()
  );
});

test('StatusCard shows error icon if error', async () => {
  render(<StatusCard status={StatusType.ERROR} title="Status Card" />);
  await waitFor(
      () => expect(screen.getByTitle('error')).toBeTruthy()
  );
});
