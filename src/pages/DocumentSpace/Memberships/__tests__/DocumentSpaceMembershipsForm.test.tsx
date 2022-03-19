import { render, waitFor } from '@testing-library/react';
import { DocumentSpaceControllerApi, DocumentSpaceControllerApiInterface } from '../../../../openapi';
import { documentSpaceMembershipService } from '../../../../state/document-space/document-space-state';
import DocumentSpaceMembershipService from '../../../../state/document-space/memberships/document-space-membership-service';
import DocumentSpaceMembershipsForm from '../DocumentSpaceMembershipsForm';

jest.mock('../../../../state/document-space/document-space-state');

describe('Document Space Membership Form Test', () => {
  const documentSpaceId = 'b8529a48-a61c-45a7-b0d1-2eb5d429d3bf';

  let documentSpaceApi: DocumentSpaceControllerApiInterface;
  let membershipService: DocumentSpaceMembershipService;

  const onMemberChangeCallback = jest.fn();

  beforeEach(() => {
    documentSpaceApi = new DocumentSpaceControllerApi();
    membershipService = new DocumentSpaceMembershipService(documentSpaceApi);

    (documentSpaceMembershipService as jest.Mock).mockReturnValue(membershipService);
  });

  it('should render form', async () => {
    jest.spyOn(membershipService, 'getAvailableAppClientsForDocumentSpace')
      .mockReturnValue(Promise.resolve([
          {
            id: 'sdfdsfsdf',
            name: 'app1',
          }
      ])
    );

    const page = render(
      <DocumentSpaceMembershipsForm
        documentSpaceId={documentSpaceId}
        onMemberChangeCallback={onMemberChangeCallback}
      />
    );

    await waitFor(() => expect(page.queryByText('Add New Member')).toBeInTheDocument());
    await waitFor(() => expect(page.queryByText('Add New App Client')).toBeInTheDocument());
  });  
});
