import React from 'react';
import { render } from '@testing-library/react';
import LoadingCellRenderer from '../LoadingCellRenderer';

describe('Loading Cell Renderer', () => {
  it('Renders loading', async () => {
    const page = render(
      <LoadingCellRenderer />
    );

    expect(page.getByTestId('loading-cell-renderer')).toBeTruthy();
    expect(page.getByText('Loading...')).toBeInTheDocument();
  });

  it('Renders value', async () => {
    const page = render(
      <LoadingCellRenderer value={'LOADED'} />
    );

    expect(page.getByTestId('loading-cell-renderer')).toBeTruthy();
    expect(page.getByText('LOADED')).toBeInTheDocument();
  });
});
