import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import CircleMinusIcon from '../../../icons/CircleMinusIcon';
import DocumentRowActionCellRenderer, { PopupMenuItem } from '../DocumentRowActionCellRenderer';

describe('Row Action Cell Renderer', () => {
  it('Renders correctly', async () => {
    const page = render(<DocumentRowActionCellRenderer node={{ data: 'data' }} menuItems={[]} />);

    expect(page.getByTestId('document-row-action-cell-renderer')).toBeTruthy();
  });

  it('Btn click handler', async () => {
    const onClick = jest.fn();
    const menuItems: PopupMenuItem[] = [
      {
        icon: CircleMinusIcon,
        onClick: onClick,
        title: 'Remove',
      },
    ];
    await act(async () => {
      const page = render(<DocumentRowActionCellRenderer node={{ data: 'data' }} menuItems={menuItems} />);
      await act(async () => {
        fireEvent.click(page.getByTitle('more'));
      });

      fireEvent.click(page.getByTitle('Remove'));
    });

    expect(onClick.mock.calls.length).toBe(1);
  });
});
