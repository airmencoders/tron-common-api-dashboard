import React from 'react';
import {act, fireEvent, render} from '@testing-library/react';
import DocumentRowActionCellRenderer from '../DocumentRowActionCellRenderer';

describe('Row Action Cell Renderer', () => {
  it('Renders correctly', async () => {
    const page = render(
        <DocumentRowActionCellRenderer node={{ data: 'data' }} actions={{delete: {action: () => {}, isAuthorized: () => true}}} />
    );

    expect(page.getByTestId('document-row-action-cell-renderer')).toBeTruthy();
  });

  it('Btn click handler', async () => {
    const onClick = jest.fn();

    await act(async() => {
      const page = render(
          <DocumentRowActionCellRenderer actions={{delete: {action: onClick, isAuthorized: () => true}}} node={{ data: 'data' }} />
      );
      await act(async ()=> {
        fireEvent.click(page.getByTitle("more"));
      });

      fireEvent.click(page.getByTitle("Remove"));
    });


    expect(onClick.mock.calls.length).toBe(1);
  });
});
