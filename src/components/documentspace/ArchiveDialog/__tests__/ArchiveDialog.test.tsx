import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ArchiveDialog from '../ArchiveDialog';

describe('Archive Dialog Tests', () => {
  let onCancel: jest.Mock;
  let onSubmit: jest.Mock;

  beforeEach(() => {
    onCancel = jest.fn();
    onSubmit = jest.fn();
  });

  it('should not render modal when show is false', () => {
    const dialog = render(
      <ArchiveDialog
        show={false}
        onCancel={onCancel}
        onSubmit={onSubmit}
        items={[]}
      />
    );

    expect(dialog.queryAllByText('Archive')).toHaveLength(0);
  });

  it('should render modal when show is true', () => {
    const dialog = render(
      <ArchiveDialog
        show={true}
        onCancel={onCancel}
        onSubmit={onSubmit}
        items={[]}
      />
    );

    expect(dialog.getAllByText('Archive').length).toBeGreaterThan(0);
  });

  it('should not allow submitting when no items given', () => {
    const dialog = render(
      <ArchiveDialog
        show={true}
        onCancel={onCancel}
        onSubmit={onSubmit}
        items={[]}
      />
    );

    expect(dialog.getByTestId('modal-submit-btn')).toBeDisabled();
    expect(dialog.getByText('No items selected')).toBeInTheDocument();
  });

  it('should show count of files when multiple items given', () => {
    const items = [
      {
        key: 'test'
      },
      {
        key: 'test2'
      }
    ];

    const dialog = render(
      <ArchiveDialog
        show={true}
        onCancel={onCancel}
        onSubmit={onSubmit}
        items={items}
      />
    );

    expect(dialog.getByText('Archive these 2 items?')).toBeInTheDocument();
  });

  it('should show file name when single item given', () => {
    const dialog = render(
      <ArchiveDialog
        show={true}
        onCancel={onCancel}
        onSubmit={onSubmit}
        items={{ key: 'test' }}
      />
    );

    expect(dialog.getByText('Archive this item - test')).toBeInTheDocument();
  });

  it('should handle submit button action', () => {
    const dialog = render(
      <ArchiveDialog
        show={true}
        onCancel={onCancel}
        onSubmit={onSubmit}
        items={{ key: 'test' }}
      />
    );

    userEvent.click(dialog.getByTestId('modal-submit-btn'));
    expect(onSubmit).toHaveBeenCalled();
  });

  it('should handle cancel button action', () => {
    const dialog = render(
      <ArchiveDialog
        show={true}
        onCancel={onCancel}
        onSubmit={onSubmit}
        items={{ key: 'test' }}
      />
    );

    userEvent.click(dialog.getByTestId('modal-cancel-btn'));
    expect(onCancel).toHaveBeenCalled();
  });
});
