import { render, waitFor } from '@testing-library/react';
import { DocumentSpaceControllerApi, DocumentSpaceControllerApiInterface } from '../../../../openapi';
import {
  documentSpaceMembershipService,
  useDocumentSpaceMembershipsPageState
} from '../../../../state/document-space/document-space-state';
import DocumentSpaceMembershipService from '../../../../state/document-space/memberships/document-space-membership-service';
import DocumentSpaceMembershipsForm from '../DocumentSpaceMembershipsForm';
import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import {
  BatchUploadState,
  DocumentSpaceMembershipsState
} from '../../../../state/document-space/memberships-page/memberships-page-state';
import DocumentSpaceMembershipsPageService
  from '../../../../state/document-space/memberships-page/memberships-page-service';

jest.mock('../../../../state/document-space/document-space-state');

describe('Document Space Membership Form Test', () => {
  const documentSpaceId = 'b8529a48-a61c-45a7-b0d1-2eb5d429d3bf';

  let documentSpaceApi: DocumentSpaceControllerApiInterface;
  let membershipService: DocumentSpaceMembershipService;
  let membershipPageState: State<DocumentSpaceMembershipsState> & StateMethodsDestroy;
  let uploadState: State<BatchUploadState> & StateMethodsDestroy;

  beforeEach(() => {
    documentSpaceApi = new DocumentSpaceControllerApi();
    membershipService = new DocumentSpaceMembershipService(documentSpaceApi);
    membershipPageState = createState<DocumentSpaceMembershipsState>({
      datasourceState: {
        datasource: undefined,
        shouldUpdateDatasource: true,
      },
      membersState: {
        selected: [],
        deletionState: {
          isConfirmationOpen: false,
        },
        membersToUpdate: [],
        submitting: false,
        memberUpdateSuccessMessage: '',
        memberUpdateFailMessage: '',
        showUpdateFailMessage: false,
        showUpdateSuccessMessage: true,
      },
      appClientsDatasourceState: {
        datasource: undefined,
        shouldUpdateDatasource: true,
      },
      appClientMembersState: {
        selected: [],
        deletionState: {
          isConfirmationOpen: false,
        },
        membersToUpdate: [],
        submitting: false,
        memberUpdateSuccessMessage: '',
        memberUpdateFailMessage: '',
        showUpdateFailMessage: false,
        showUpdateSuccessMessage: false,
      },
      selectedTab: 0,
    });

    uploadState = createState<BatchUploadState>({
      successErrorState: {
        successMessage: 'Successfully added members to Document Space',
        errorMessage: '',
        showSuccessMessage: false,
        showErrorMessage: false,
        showCloseButton: true,
      }
    });

    (documentSpaceMembershipService as jest.Mock).mockReturnValue(membershipService);
    (useDocumentSpaceMembershipsPageState as jest.Mock)
      .mockReturnValue(new DocumentSpaceMembershipsPageService(membershipPageState, uploadState, membershipService));
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
      />
    );

    await waitFor(() => expect(page.queryByText('Add New Member')).toBeInTheDocument());
    await waitFor(() => expect(page.queryByText('Add New App Client')).toBeInTheDocument());
  });  
});
