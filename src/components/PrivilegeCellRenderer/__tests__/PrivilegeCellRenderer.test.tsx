import React from 'react';
import { render } from '@testing-library/react';
import PrivilegeCellRenderer from '../PrivilegeCellRenderer';

describe('Privilege Cell Renderer', () => {
  it('Privilege True', async () => {
    const page = render(
      <PrivilegeCellRenderer value={true} />
    );

    expect(page.getByTestId('privilege-true')).toBeTruthy();
  });

  it('Privilege False', async () => {
    const page = render(
      <PrivilegeCellRenderer value={false} />
    );

    expect(page.getByTestId('privilege-false')).toBeTruthy();
  });
});
