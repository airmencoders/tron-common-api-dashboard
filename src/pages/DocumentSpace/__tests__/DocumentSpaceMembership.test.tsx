import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentSpaceControllerApi, DocumentSpaceControllerApiInterface } from '../../../openapi';
import DocumentSpaceMembershipService from '../../../state/document-space/document-space-membership-service';
import { documentSpaceMembershipService } from '../../../state/document-space/document-space-state';
import { createAxiosSuccessResponse } from '../../../utils/TestUtils/test-utils';
import DocumentSpaceMemberships from '../DocumentSpaceMemberships';

jest.mock('../../../state/document-space/document-space-state');

describe('Document Space Membership Test', () => {
  const documentSpaceId = 'b8529a48-a61c-45a7-b0d1-2eb5d429d3bf';

  let documentSpaceApi: DocumentSpaceControllerApiInterface;
  let membershipService: DocumentSpaceMembershipService;

  beforeEach(() => {
    documentSpaceApi = new DocumentSpaceControllerApi();
    membershipService = new DocumentSpaceMembershipService(documentSpaceApi);

    (documentSpaceMembershipService as jest.Mock).mockReturnValue(membershipService);
  });

  it('should not show modal when isOpen is false', () => {
    const onSubmit = jest.fn();
    const page = render(
      <DocumentSpaceMemberships
        documentSpaceId={documentSpaceId}
        onSubmit={onSubmit}
        isOpen={false}
      />
    );

    expect(page.queryByText('Member Management')).not.toBeInTheDocument();
  });

  it('should show modal when isOpen is true', () => {
    const onSubmit = jest.fn();

    const page = render(
      <DocumentSpaceMemberships
        documentSpaceId={documentSpaceId}
        onSubmit={onSubmit}
        isOpen={true}
      />
    );

    expect(page.queryByText('Member Management')).toBeInTheDocument();
  });

  it('should close modal when Submit(close) button pressed', () => {
    const onSubmit = jest.fn();
    const page = render(
      <DocumentSpaceMemberships
        documentSpaceId={documentSpaceId}
        onSubmit={onSubmit}
        isOpen={true}
      />
    );

    expect(page.queryByText('Member Management')).toBeInTheDocument();
    userEvent.click(page.getByText('Close'));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('should trigger infinite cache update on member change', async () => {
    const onSubmit = jest.fn();
    const page = render(
      <DocumentSpaceMemberships
        documentSpaceId={documentSpaceId}
        onSubmit={onSubmit}
        isOpen={true}
      />
    );

    expect(page.queryByText('Member Management')).toBeInTheDocument();

    const response = jest.fn(() => {
      return Promise.resolve(createAxiosSuccessResponse({}));
    });
    const addMemberSpy = jest.spyOn(membershipService, 'addDocumentSpaceMember').mockImplementation(response);

    const emailField = page.getByLabelText('Email');
    expect(emailField).toBeInTheDocument();
    userEvent.type(emailField, 'test@email.com');

    const readPrivilegeCheckbox = page.getByLabelText('READ');
    expect(readPrivilegeCheckbox).toBeInTheDocument();
    userEvent.click(readPrivilegeCheckbox);

    const addBtn = page.getByText('Add');
    expect(addBtn).toBeEnabled();
    userEvent.click(addBtn);

    await waitFor(() => expect(response).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(addMemberSpy).toHaveBeenCalledTimes(1));
  });
});