import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import UnusedEndpointCellRenderer from '../UnusedEndpointCellRenderer';

describe('Unused Endpoint Cell Renderer', () => {
  it('Unused Endpoint True', async () => {
    const data = {deleted: true};
    const page = render(
      <UnusedEndpointCellRenderer value={"/endpoint/path"} data={data} />
    );

    expect(page.getByTestId('unused-true')).toBeTruthy();
  });

  it('Unused Endpoint False', async () => {
    const data = {deleted: false};
    const page = render(
      <UnusedEndpointCellRenderer value={"/endpoint/path"} data={data} />
    );

    expect(page.getByTestId('unused-false')).toBeTruthy();
  });
});
