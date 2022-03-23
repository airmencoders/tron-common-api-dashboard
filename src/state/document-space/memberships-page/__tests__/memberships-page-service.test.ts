import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { AxiosPromise } from 'axios';
import { FormEvent } from 'react';
import { DocumentSpaceAppClientMemberRequestDto, DocumentSpaceAppClientResponseDto, DocumentSpaceControllerApi, DocumentSpaceDashboardMemberRequestDto, DocumentSpaceDashboardMemberResponseDto } from '../../../../openapi';
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
    expect(membershipPageState.datasourceState.shouldUpdateDatasource.get()).toBeFalsy();
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

    apiSpy.mockReset();
    apiSpy = jest.spyOn(membershipService, 'removeDocumentSpaceDashboardMembers').mockReturnValue(Promise.reject({}) as AxiosPromise);
    membershipPageService.onMemberDeleteConfirmation('id', true);
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
    let apiSpy = jest.spyOn(membershipService, 'addDocumentSpaceMember').mockReturnValue(Promise.resolve());
    const member: DocumentSpaceDashboardMemberRequestDto = {
      email: 'dude@dude.com',
      privileges: []
    };
    membershipPageState.membersState.membersToUpdate.set([ member ]);
    await membershipPageService.saveMembers('id', { preventDefault: () => {} } as FormEvent<HTMLFormElement>);
    expect(apiSpy).toHaveBeenCalled();
    expect(membershipPageState.membersState.membersToUpdate.get()).toHaveLength(0);
    expect(membershipPageState.membersState.memberUpdateSuccessMessage.get()).toEqual('Members Updated');


    apiSpy.mockReset();
    apiSpy = jest.spyOn(membershipService, 'addDocumentSpaceMember').mockReturnValue(Promise.reject());
    membershipPageState.membersState.membersToUpdate.set([ member ]);
    await membershipPageService.saveMembers('id', { preventDefault: () => {} } as FormEvent<HTMLFormElement>);
    expect(membershipPageState.membersState.memberUpdateSuccessMessage.get()).toEqual('Error saving member permissions');
  });

  // app client specific members

  it('Handles app client member deletion candidates', () => {
    
    // puts a member in the to-delete state
    const member: DocumentSpaceAppClientResponseDto = {
      appClientName: 'app1',
      appClientId: 'some id',
      privileges: []
    };

    membershipPageService.onAppClientMemberSelectionChange(member, 'selected');
    expect(membershipPageState.appClientMembersState.selected.get()).toContainEqual(member);

    // doesn't duplicate
    membershipPageService.onAppClientMemberSelectionChange(member, 'selected');
    expect(membershipPageState.appClientMembersState.selected.get()).toHaveLength(1);

    // does remove from deletion state
    membershipPageService.onAppClientMemberSelectionChange(member, 'unselected');
    expect(membershipPageState.appClientMembersState.selected.get()).not.toContainEqual(member);
    expect(membershipPageState.appClientMembersState.selected.get()).toHaveLength(0);
  });

  it('updates app client state for datasource callback', () => {
    membershipPageService.onAppClientDatasourceUpdateCallback();
    expect(membershipPageState.appClientsDatasourceState.shouldUpdateDatasource.get()).toBeFalsy();
  });

  it('updates app client member privs on dropdown seletion change', () => {
    const member: DocumentSpaceAppClientResponseDto = {
      appClientName: 'app1',
      appClientId: 'id',
      privileges: []
    };

    membershipPageService.onAppClientMemberPrivilegeDropDownChanged(member, 'EDITOR');
    expect(membershipPageState.appClientMembersState.membersToUpdate.get()).toHaveLength(1);

    // no dupes
    membershipPageService.onAppClientMemberPrivilegeDropDownChanged(member, 'ADMIN');
    expect(membershipPageState.appClientMembersState.membersToUpdate.get()).toHaveLength(1);
  });

  it('performs app client member deletion confirmation', async () => {
    let apiSpy = jest.spyOn(membershipService, 'removeDocumentSpaceAppClientMember').mockReturnValue(Promise.resolve({}) as AxiosPromise);
    const member: DocumentSpaceAppClientResponseDto = {
      appClientName: 'app1',
      appClientId: 'id',
      privileges: []
    };
    membershipPageState.appClientMembersState.selected.set([ member ]);
    membershipPageService.onAppClientMemberDeleteConfirmation('id', true);
    expect(apiSpy).toHaveBeenCalled();
    expect(membershipPageState.appClientsDatasourceState.shouldUpdateDatasource.get()).toBeTruthy();

    // doesnt refetch data on error
    membershipPageState.appClientsDatasourceState.shouldUpdateDatasource.set(false);

    apiSpy.mockReset();
    apiSpy = jest.spyOn(membershipService, 'removeDocumentSpaceAppClientMember').mockReturnValue(Promise.reject({}) as AxiosPromise);
    membershipPageService.onAppClientMemberDeleteConfirmation('id', true);
    expect(membershipPageState.appClientsDatasourceState.shouldUpdateDatasource.get()).toBeFalsy();
  });

  it('queues the delete confirmation on app client member deletion', () => {
    const member: DocumentSpaceAppClientResponseDto = {
      appClientName: 'app1',
      appClientId: 'id',
      privileges: []
    };

    membershipPageService.deleteAppClientMemberRow(member);
    expect(membershipPageState.appClientMembersState.deletionState.isConfirmationOpen.get()).toBeTruthy();
    expect(membershipPageState.appClientMembersState.selected).toHaveLength(1);
  });

  it('saves app client members that have been queued for updating', async () => {
    let apiSpy = jest.spyOn(membershipService, 'addDocumentSpaceAppClientMember').mockReturnValue(Promise.resolve());
    const member: DocumentSpaceAppClientMemberRequestDto = {
      appClientId: 'dude@dude.com',
      privileges: []
    };
    membershipPageState.appClientMembersState.membersToUpdate.set([ member ]);
    await membershipPageService.saveAppClientMembers('id', { preventDefault: () => {} } as FormEvent<HTMLFormElement>);
    expect(apiSpy).toHaveBeenCalled();
    expect(membershipPageState.appClientMembersState.membersToUpdate.get()).toHaveLength(0);
    expect(membershipPageState.appClientMembersState.memberUpdateSuccessMessage.get()).toEqual('App Client Members Updated');


    apiSpy.mockReset();
    apiSpy = jest.spyOn(membershipService, 'addDocumentSpaceAppClientMember').mockReturnValue(Promise.reject());
    membershipPageState.appClientMembersState.membersToUpdate.set([ member ]);
    await membershipPageService.saveAppClientMembers('id', { preventDefault: () => {} } as FormEvent<HTMLFormElement>);
    expect(membershipPageState.appClientMembersState.memberUpdateSuccessMessage.get()).toEqual('Error saving App Client member permissions');
  });
});