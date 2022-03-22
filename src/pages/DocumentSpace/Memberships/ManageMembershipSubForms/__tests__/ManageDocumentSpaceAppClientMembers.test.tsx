import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { render, waitFor } from '@testing-library/react';
import { IDatasource, IGetRowsParams } from 'ag-grid-community';
import React from 'react';
import { DocumentSpaceAppClientResponseDto, DocumentSpaceAppClientResponseDtoPrivilegesEnum, DocumentSpaceControllerApiInterface } from '../../../../../openapi';
import { documentSpaceMembershipService, useDocumentSpaceMembershipsPageState } from '../../../../../state/document-space/document-space-state';
import DocumentSpaceMembershipsPageService from '../../../../../state/document-space/memberships-page/memberships-page-service';
import { BatchUploadState, DocumentSpaceMembershipsState } from '../../../../../state/document-space/memberships-page/memberships-page-state';
import DocumentSpaceMembershipService from '../../../../../state/document-space/memberships/document-space-membership-service';
import ManageDocumentSpaceAppClientMembers from '../ManageDocumentSpaceAppClientMembers';

jest.mock('../../../../../state/document-space/document-space-state');

const mockMembers: DocumentSpaceAppClientResponseDto[] = [
  {
    appClientId: 'sdfsdf',
    appClientName: "app1",
    privileges: [
      DocumentSpaceAppClientResponseDtoPrivilegesEnum.Write,
    ],
  },
  {
    appClientId: 'sdfsdf2',
    appClientName: 'app2',
    privileges: [
      DocumentSpaceAppClientResponseDtoPrivilegesEnum.Write,
    ],
  },
];

const defaultUserDatasource: IDatasource = {
  getRows: async (params: IGetRowsParams) => {
    params.startRow = 0;
    params.endRow = 1;
    params.successCallback(mockMembers);
  },
};

describe('Manage Document Space App Client Tests', () => {
  let membershipService: DocumentSpaceMembershipService;
  let membershipPageState: State<DocumentSpaceMembershipsState> & StateMethodsDestroy;
  let uploadState: State<BatchUploadState> & StateMethodsDestroy;


  beforeEach(() => {
    membershipPageState = createState<DocumentSpaceMembershipsState>({
      datasourceState: {
        datasource: defaultUserDatasource,
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
        datasource: defaultUserDatasource,
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

  it('should render a list of app client users assigned', async () => {
    const closeHandler = jest.fn();
    const page = render(
      <ManageDocumentSpaceAppClientMembers
        documentSpaceId="some id"
        onCloseHandler={closeHandler}
      />
    );

    await waitFor(() => expect(page.getByText('app1')).toBeVisible());
    await waitFor(() => expect(page.getByText('app2')).toBeVisible());
  });

});