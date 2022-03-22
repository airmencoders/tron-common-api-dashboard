import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  DocumentSpaceControllerApi,
  DocumentSpaceControllerApiInterface
} from '../../../../openapi/apis/document-space-controller-api';
import DocumentSpaceMembershipService
  from '../../../../state/document-space/memberships/document-space-membership-service';
import {
  documentSpaceMembershipService,
  useDocumentSpaceMembershipsPageState
} from '../../../../state/document-space/document-space-state';
import DocumentSpaceMembershipsDrawer from '../DocumentSpaceMembershipsDrawer';
import {
  BatchUploadState,
  DocumentSpaceMembershipsState
} from '../../../../state/document-space/memberships-page/memberships-page-state';
import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import DocumentSpaceMembershipsPageService
  from '../../../../state/document-space/memberships-page/memberships-page-service';

jest.mock('../../../../openapi/apis/document-space-controller-api');
jest.mock('../../../../state/document-space/document-space-state');

describe('Document Space Membership Drawer Tests', () => {
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

  it('should close modal when Submit(close) button pressed', async () => {
    const onClose = jest.fn();
    const page = render(
      <DocumentSpaceMembershipsDrawer
        documentSpaceId={documentSpaceId}
        onSubmit={jest.fn()}
        isOpen={true}
        onCloseHandler={onClose}
      />
    );

    expect(page.queryByText('Member Management')).toBeInTheDocument();
    userEvent.click(page.getAllByText('Close')[0]);
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it('should render the initial memberships drawer state', async () => {
    const onSubmit = jest.fn();
    const page = render(
      <DocumentSpaceMembershipsDrawer
        documentSpaceId={documentSpaceId}
        onSubmit={onSubmit}
        isOpen={true}
        onCloseHandler={jest.fn()}
      />
    );

    await waitFor(() => expect(page.queryByText('Add New Member')).toBeInTheDocument());
    await waitFor(() => expect(page.queryByText('Add New App Client')).toBeInTheDocument());
    await waitFor(() => expect(page.queryByText('Add Member')).toBeInTheDocument());
    await waitFor(() => expect(page.queryByText('Manage Members')).toBeInTheDocument());
    await waitFor(() => expect(page.queryByText('Manage App Clients')).toBeInTheDocument());
  });

});