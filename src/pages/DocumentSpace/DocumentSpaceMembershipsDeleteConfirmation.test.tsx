import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DocumentSpaceMembershipsDeleteConfirmation from './DocumentSpaceMembershipsDeleteConfirmation';

describe('Test Document Space Memberships Delete Confirmation', () => {
  let onMemberDeleteConfirmation: jest.Mock;
  let onCancel: jest.Mock;

  beforeEach(() => {
    onMemberDeleteConfirmation = jest.fn();
    onCancel = jest.fn();
  });

  it('should not be visible when show is false', () => {
    const page = render(
      <DocumentSpaceMembershipsDeleteConfirmation
        onMemberDeleteConfirmationSubmit={onMemberDeleteConfirmation}
        onCancel={onCancel}
        show={false}
        selectedMemberCount={1}
      />
    );

    expect(page.queryByTitle('Member Deletion Warning')).not.toBeInTheDocument();
  });

  it('should be visible when show is true', () => {
    const page = render(
      <DocumentSpaceMembershipsDeleteConfirmation
        onMemberDeleteConfirmationSubmit={onMemberDeleteConfirmation}
        onCancel={onCancel}
        show={true}
        selectedMemberCount={1}
      />
    );

    expect(page.queryByTitle('Member Deletion Warning')).toBeInTheDocument();
  });

  it('should call onMemberDeleteConfirmationSubmit function when Delete confirm', async () => {
    const page = render(
      <DocumentSpaceMembershipsDeleteConfirmation
        onMemberDeleteConfirmationSubmit={onMemberDeleteConfirmation}
        onCancel={onCancel}
        show={true}
        selectedMemberCount={1}
      />
    );

    expect(page.queryByTitle('Member Deletion Warning')).toBeInTheDocument();

    const deleteButton = page.getByText('Delete');
    expect(deleteButton).toBeInTheDocument();
    userEvent.click(deleteButton);

    await waitFor(() => expect(onMemberDeleteConfirmation).toHaveBeenCalledTimes(1));
  });

  it('should call onCancel function when Cancel clicked', async () => {
    const page = render(
      <DocumentSpaceMembershipsDeleteConfirmation
        onMemberDeleteConfirmationSubmit={onMemberDeleteConfirmation}
        onCancel={onCancel}
        show={true}
        selectedMemberCount={1}
      />
    );

    expect(page.queryByTitle('Member Deletion Warning')).toBeInTheDocument();

    const cancelButton = page.getByText('Cancel');
    expect(cancelButton).toBeInTheDocument();
    userEvent.click(cancelButton);

    await waitFor(() => expect(onCancel).toHaveBeenCalledTimes(1));
  });

  it('should call onCancel function when close clicked', async () => {
    const page = render(
      <DocumentSpaceMembershipsDeleteConfirmation
        onMemberDeleteConfirmationSubmit={onMemberDeleteConfirmation}
        onCancel={onCancel}
        show={true}
        selectedMemberCount={1}
      />
    );

    expect(page.queryByTitle('Member Deletion Warning')).toBeInTheDocument();

    const closeButton = page.getByTitle('close');
    expect(closeButton).toBeInTheDocument();
    userEvent.click(closeButton);

    await waitFor(() => expect(onCancel).toHaveBeenCalledTimes(1));
  });
});