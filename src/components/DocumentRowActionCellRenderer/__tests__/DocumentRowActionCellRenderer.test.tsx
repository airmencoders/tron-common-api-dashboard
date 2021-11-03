import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import DocumentRowActionCellRenderer from '../DocumentRowActionCellRenderer';
import userEvent from '@testing-library/user-event';

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

  it('Should render action that is authorized', async () => {
    const { getByTitle, findByTitle } = render(
      <DocumentRowActionCellRenderer
        node={{ data: 'data' }}
        actions={{ delete: { action: () => { }, isAuthorized: () => true } }}
      />
    );

    const moreAction = getByTitle('more');
    userEvent.click(moreAction);
    await waitFor(() => expect(findByTitle('Remove')).resolves.toBeInTheDocument());
  });

  it('Should not render action that is not authorized', async () => {
    const { getByTitle, queryByTitle } = render(
      <DocumentRowActionCellRenderer
        node={{ data: 'data' }}
        actions={{ delete: { action: () => { }, isAuthorized: () => false } }}
      />
    );

    const moreAction = getByTitle('more');
    userEvent.click(moreAction);
    await waitFor(() => expect(queryByTitle('Remove')).not.toBeInTheDocument());
  });
});
