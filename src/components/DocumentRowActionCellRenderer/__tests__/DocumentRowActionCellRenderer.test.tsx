import { act, render, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CircleMinusIcon from '../../../icons/CircleMinusIcon';
import DocumentRowActionCellRenderer, { PopupMenuItem } from '../DocumentRowActionCellRenderer';

describe('Row Action Cell Renderer', () => {
  let onClick: jest.Mock;

  beforeEach(() => {
    onClick = jest.fn();
  });

  it('should render when length of menuItems is > 0 after being filtered for shown and authorized elements', () => {
    const page = render(
      <DocumentRowActionCellRenderer node={{ data: 'data' }} 
        menuItems={[
          {
            title: 'Remove',
            icon: CircleMinusIcon,
            onClick: onClick,
            isAuthorized: () => true
          }
        ]}
      />
    );

    expect(page.getByTestId('document-row-action-cell-renderer')).toBeTruthy();
  });

  it('should not render when there are 0 menuItems after being filtered for shown and authorized elements', () => {
    const page = render(
      <DocumentRowActionCellRenderer node={{ data: 'data' }} 
        menuItems={[
          {
            title: 'Remove',
            icon: CircleMinusIcon,
            onClick: onClick,
            isAuthorized: () => false
          }
        ]}
      />
    );

    expect(page.queryByTestId('document-row-action-cell-renderer')).not.toBeInTheDocument();
  });

  it('Btn click handler', async () => {
    const menuItems: PopupMenuItem<any>[] = [
      {
        icon: CircleMinusIcon,
        onClick: onClick,
        title: 'Remove',
        isAuthorized: () => true
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

  it('Should render action that is authorized', async () => {
    const menuItems: PopupMenuItem<any>[] = [
      {
        icon: CircleMinusIcon,
        onClick: onClick,
        title: 'Remove',
        isAuthorized: () => true
      },
    ];

    const { getByTitle, findByTitle } = render(
      <DocumentRowActionCellRenderer
        node={{ data: 'data' }}
        menuItems={menuItems}
      />
    );

    const moreAction = getByTitle('more');
    userEvent.click(moreAction);
    await waitFor(() => expect(findByTitle('Remove')).resolves.toBeInTheDocument());
  });

  it('Should not render action that is not authorized', async () => {
    const menuItems: PopupMenuItem<any>[] = [
      {
        icon: CircleMinusIcon,
        onClick: onClick,
        title: 'Remove',
        isAuthorized: () => false
      },
      {
        icon: CircleMinusIcon,
        onClick: onClick,
        title: 'Exists',
        isAuthorized: () => true
      },
    ];

    const { getByTitle, queryByTitle } = render(
      <DocumentRowActionCellRenderer
        node={{ data: 'data' }}
        menuItems={menuItems}
      />
    );

    const moreAction = getByTitle('more');
    userEvent.click(moreAction);
    await waitFor(() => expect(queryByTitle('Remove')).not.toBeInTheDocument());
  });
});
