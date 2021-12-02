import { fireEvent, render, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentSpaceDashboardMemberResponseDto } from '../../../../openapi';
import { DocumentSpaceControllerApi, DocumentSpaceControllerApiInterface } from '../../../../openapi/apis/document-space-controller-api';
import DocumentSpaceMembershipService from '../../../../state/document-space/memberships/document-space-membership-service';
import { documentSpaceMembershipService } from '../../../../state/document-space/document-space-state';
import { createAxiosSuccessResponse } from '../../../../utils/TestUtils/test-utils';
import DocumentSpaceMemberships from '../DocumentSpaceMemberships';

jest.mock('../../../../openapi/apis/document-space-controller-api');
jest.mock('../../../../state/document-space/document-space-state');

describe('Document Space Membership Test', () => {
  const documentSpaceId = 'b8529a48-a61c-45a7-b0d1-2eb5d429d3bf';

  let documentSpaceApi: DocumentSpaceControllerApiInterface;
  let membershipService: DocumentSpaceMembershipService;

  beforeEach(() => {
    documentSpaceApi = new DocumentSpaceControllerApi();
    membershipService = new DocumentSpaceMembershipService(documentSpaceApi);

    (documentSpaceMembershipService as jest.Mock).mockReturnValue(membershipService);
  });

  it('should close modal when Submit(close) button pressed', () => {
    const onClose = jest.fn();
    const page = render(
      <DocumentSpaceMemberships
        documentSpaceId={documentSpaceId}
        onSubmit={jest.fn()}
        isOpen={true}
        onCloseHandler={onClose}
      />
    );

    expect(page.queryByText('Member Management')).toBeInTheDocument();
    userEvent.click(page.getByText('Close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should trigger infinite cache update on member change', async () => {
    const onSubmit = jest.fn();
    const page = render(
      <DocumentSpaceMemberships
        documentSpaceId={documentSpaceId}
        onSubmit={onSubmit}
        isOpen={true}
        onCloseHandler={jest.fn()}
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

    const writePrivilegeCheckbox = page.getByLabelText('Editor');
    expect(writePrivilegeCheckbox).toBeInTheDocument();
    userEvent.click(writePrivilegeCheckbox);

    const addBtn = page.getByText('Add');
    expect(addBtn).toBeEnabled();
    userEvent.click(addBtn);

    await waitFor(() => expect(response).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(addMemberSpy).toHaveBeenCalledTimes(1));
  });

  it('should allow managing of members privileges', async () => {
    const onSubmit = jest.fn();

    jest.spyOn(documentSpaceApi, 'getDashboardUsersForDocumentSpace').mockReturnValue(Promise.resolve(createAxiosSuccessResponse({ 
      data: [ { email: 'joe@test.com', id: 'blah', privileges: [ { id: 'fsdf', type: 'WRITE' }] } ] as DocumentSpaceDashboardMemberResponseDto[]
    })));

    const page = render(
      <DocumentSpaceMemberships
        documentSpaceId={documentSpaceId}
        onSubmit={onSubmit}
        isOpen={true}
        onCloseHandler={jest.fn()}
      />
    );

    fireEvent.click(page.getByText('Manage Members'));
    await waitFor(() => expect(page.getByText('Assigned Members')).toBeVisible());
    await waitFor(() => expect(page.getByText('joe@test.com')).toBeVisible());
  });
});
