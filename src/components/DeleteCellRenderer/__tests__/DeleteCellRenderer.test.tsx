import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import DeleteCellRenderer from '../DeleteCellRenderer';

describe('Delete Cell Renderer', () => {
  it('Renders correctly', async () => {
    const page = render(
      <DeleteCellRenderer />
    );

    expect(page.getByTestId('delete-cell-renderer')).toBeTruthy();
  });

  it('Btn click handler', async () => {
    const onClick = jest.fn();

    const page = render(
      <DeleteCellRenderer onClick={onClick} />
    );

    fireEvent.click(page.getByTitle("remove"));

    expect(onClick.mock.calls.length).toBe(1);
  });
});
