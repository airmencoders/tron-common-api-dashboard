import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { AxiosPromise } from 'axios';
import { DocumentSpaceAppClientResponseDto, DocumentSpaceControllerApi, DocumentSpaceDashboardMemberResponseDto } from '../../../../openapi';
import DocumentSpaceMembershipService from '../../memberships/document-space-membership-service';
import DocumentSpaceMembershipsPageService from '../memberships-page-service';
import { BatchUploadState, DocumentSpaceMembershipsState } from '../memberships-page-state';

jest.mock('../../memberships/document-space-membership-service');

describe('Membership Page Service Tests', () => {

  let membershipPageService: DocumentSpaceMembershipsPageService;
  let membershipService: DocumentSpaceMembershipService;
  let membershipPageState: State<DocumentSpaceMembershipsState> & StateMethodsDestroy;
  let batchUploadState: State<BatchUploadState> & StateMethodsDestroy;

  beforeEach(() => {
    membershipService = new DocumentSpaceMembershipService({} as DocumentSpaceControllerApi);
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

    batchUploadState = createState<BatchUploadState>({
      successErrorState: {
        successMessage: 'Successfully added members to Document Space',
        errorMessage: '',
        showSuccessMessage: false,
        showErrorMessage: false,
        showCloseButton: true,
      }
    });

    membershipPageService = new DocumentSpaceMembershipsPageService(
      membershipPageState,
      batchUploadState,
      membershipService
    );

  });

  it('Handles member deletion candidates', () => {
    
    // puts a member in the to-delete state
    const member: DocumentSpaceDashboardMemberResponseDto = {
      email: 'dude@dude.com',
      id: 'some id',
      privileges: []
    };

    membershipPageService.onMemberSelectionChange(member, 'selected');
    expect(membershipPageState.membersState.selected.get()).toContainEqual(member);

    // doesn't duplicate
    membershipPageService.onMemberSelectionChange(member, 'selected');
    expect(membershipPageState.membersState.selected.get()).toHaveLength(1);

    // does remove from deletion state
    membershipPageService.onMemberSelectionChange(member, 'unselected');
    expect(membershipPageState.membersState.selected.get()).not.toContainEqual(member);
    expect(membershipPageState.membersState.selected.get()).toHaveLength(0);
  });

  it('updates state for datasource callback', () => {
    membershipPageService.onDatasourceUpdateCallback();
    expect(membershipPageState.datasourceState.shouldUpdateDatasource.get()).toBeTruthy();
  });

  it('updates member privs on dropdown seletion change', () => {
    const member: DocumentSpaceDashboardMemberResponseDto = {
      email: 'dude@dude.com',
      id: 'some id',
      privileges: []
    };

    membershipPageService.onMemberPrivilegeDropDownChanged(member, 'EDITOR');
    expect(membershipPageState.membersState.membersToUpdate.get()).toHaveLength(1);

    // no dupes
    membershipPageService.onMemberPrivilegeDropDownChanged(member, 'ADMIN');
    expect(membershipPageState.membersState.membersToUpdate.get()).toHaveLength(1);
  });

  it('resets state of the members and app clients', () => {
    membershipPageState.membersState.selected.set([ {} as DocumentSpaceDashboardMemberResponseDto]);
    membershipPageState.membersState.deletionState.isConfirmationOpen.set(true);

    membershipPageState.appClientMembersState.selected.set([ {} as DocumentSpaceAppClientResponseDto]);
    membershipPageState.appClientMembersState.deletionState.isConfirmationOpen.set(true);

    membershipPageService.resetMemberState();

    expect(membershipPageState.membersState.selected).toHaveLength(0);
    expect(membershipPageState.membersState.deletionState.isConfirmationOpen.get()).toBeFalsy();

    expect(membershipPageState.appClientMembersState.selected).toHaveLength(0);
    expect(membershipPageState.appClientMembersState.deletionState.isConfirmationOpen.get()).toBeFalsy();
  });

  it('performs member deletion confirmation', async () => {
    let apiSpy = jest.spyOn(membershipService, 'removeDocumentSpaceDashboardMembers').mockReturnValue(Promise.resolve({}) as AxiosPromise);
    membershipPageService.onMemberDeleteConfirmation('id', true);
    expect(apiSpy).toHaveBeenCalled();
    expect(membershipPageState.datasourceState.shouldUpdateDatasource.get()).toBeTruthy();

    // doesnt refetch data on error
    membershipPageState.datasourceState.shouldUpdateDatasource.set(false);

    apiSpy = jest.spyOn(membershipService, 'removeDocumentSpaceDashboardMembers').mockReturnValue(Promise.reject({}) as AxiosPromise);
    expect(membershipPageState.datasourceState.shouldUpdateDatasource.get()).toBeFalsy();
  });

  it('queues the delete confirmation on member deletion', () => {
    const member: DocumentSpaceDashboardMemberResponseDto = {
      email: 'dude@dude.com',
      id: 'some id',
      privileges: []
    };

    membershipPageService.deleteMemberRow(member);
    expect(membershipPageState.membersState.deletionState.isConfirmationOpen.get()).toBeTruthy();
    expect(membershipPageState.membersState.selected).toHaveLength(1);
  });

  it('saves members that have been queued for updating', async () => {
    
  });
});