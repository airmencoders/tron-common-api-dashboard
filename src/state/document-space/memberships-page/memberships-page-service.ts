/**
 * This is the service that backs the Membership related components into one testable service
 */

import { none, State } from "@hookstate/core";
import { FormEvent } from "react";
import { InfiniteScrollOptions } from "../../../components/DataCrudFormPage/infinite-scroll-options";
import { GridSelectionType } from "../../../components/Grid/grid-selection-type";
import { ToastType } from "../../../components/Toast/ToastUtils/toast-type";
import { createTextToast } from "../../../components/Toast/ToastUtils/ToastUtils";
import { DocumentSpaceAppClientMemberRequestDtoPrivilegesEnum, DocumentSpaceAppClientResponseDto, DocumentSpaceDashboardMemberRequestDtoPrivilegesEnum, DocumentSpaceDashboardMemberResponseDto } from "../../../openapi";
import { unResolvePrivName } from "../../../utils/document-space-utils";
import { prepareRequestError } from "../../../utils/ErrorHandling/error-handling-utils";
import { AbstractGlobalStateService } from "../../global-service/abstract-global-state-service";
import DocumentSpaceMembershipService from "../memberships/document-space-membership-service";
import { BatchUploadState, DocumentSpaceMembershipsState } from "./memberships-page-state";

 export default class DocumentSpaceMembershipsPageService extends AbstractGlobalStateService<DocumentSpaceMembershipsState> {

  constructor(
    public membershipsPageState: State<DocumentSpaceMembershipsState>,
    public batchUploadState: State<BatchUploadState>,
    public membershipsService: DocumentSpaceMembershipService
  ) {
    super(membershipsPageState);
  }

  private scrollOptions(): InfiniteScrollOptions {
    return {
      enabled: true,
      limit: 100,
    };
  }

  get infiniteScrollOptions(): InfiniteScrollOptions {
    return this.scrollOptions(); 
  }

  onMemberSelectionChange(data: DocumentSpaceDashboardMemberResponseDto, selectionEvent: GridSelectionType): void {
    if (selectionEvent === 'selected') {
      this.addMemberToDeleteState(data);
    } else {
      this.removeMemberFromDeleteState(data.id);
    }
  }

  // for a given priv change from member-management list, add the changed user to membersToUpdateState
  onMemberPrivilegeDropDownChanged(row: DocumentSpaceDashboardMemberResponseDto, item: string): void {
    const memberUpdateIndex = this.membershipsPageState.membersState.membersToUpdate.value.findIndex(
      (i) => i.email === row.email
    );
    if (memberUpdateIndex === -1) {
      this.membershipsPageState.membersState.membersToUpdate.merge([
        {
          email: row.email,
          privileges: unResolvePrivName(
            item
          ) as DocumentSpaceDashboardMemberRequestDtoPrivilegesEnum[],
        },
      ]);
    } else {
      // we've already staged this member for an update, so update existing pending-update
      this.membershipsPageState.membersState.membersToUpdate[memberUpdateIndex].set({
        email: row.email,
        privileges: unResolvePrivName(item) as DocumentSpaceDashboardMemberRequestDtoPrivilegesEnum[],
      });
    }
  }

  onDatasourceUpdateCallback(): void {
    this.membershipsPageState.datasourceState.merge({
      shouldUpdateDatasource: false,
    });
  }

  resetMemberState() {
    this.membershipsPageState.membersState.merge({
      selected: [],
      deletionState: {
        isConfirmationOpen: false,
      },
    });

    this.membershipsPageState.appClientMembersState.merge({
      selected: [],
      deletionState: {
        isConfirmationOpen: false,
      }
    });
  }

  async onMemberDeleteConfirmation(documentSpaceId: string, mounted: boolean) {
    try {
      await this.membershipsService.removeDocumentSpaceDashboardMembers(
        documentSpaceId,
        this.membershipsPageState.membersState.selected.value
      );

      // Refresh the member list
      // Clean up state
      if (mounted) {
        this.onMemberChangeCallback();
        createTextToast(
          ToastType.SUCCESS,
          `Deleted (${this.membershipsPageState.membersState.selected.value.length}) Document Space Dashboard Users`
        );

        this.resetMemberState();
      }
    } catch (err) {
      const preparedError = prepareRequestError(err);

      if (mounted) {
        createTextToast(ToastType.ERROR, preparedError.message);
      }
    }
  }

  addMemberToDeleteState(row: DocumentSpaceDashboardMemberResponseDto): void {
    if (
      this.membershipsPageState.membersState.selected.value &&
      !this.membershipsPageState.membersState.selected.value.find((i) => i.email === row.email)
    ) {
      this.membershipsPageState.membersState.selected.merge([row]);
    }
  }

  removeMemberFromDeleteState(id: string): void {
    this.membershipsPageState.membersState.selected.find((member) => member.value.id === id)?.set(none);
  }

  deleteMemberRow(row: DocumentSpaceDashboardMemberResponseDto): void {
    this.addMemberToDeleteState(row);
    this.membershipsPageState.membersState.deletionState.isConfirmationOpen.set(true);
  }

  async saveMembers(documentSpaceId: string, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      this.membershipsPageState.membersState.merge({ submitting: true });
      for (const member of this.membershipsPageState.membersState.membersToUpdate.get()) {
        await this.membershipsService.addDocumentSpaceMember(documentSpaceId, member);
      }

      this.membershipsPageState.membersState.merge({
        showUpdateFailMessage: false,
        showUpdateSuccessMessage: true,
        memberUpdateSuccessMessage: 'Members Updated',
      });
    } catch (e) {
      this.membershipsPageState.membersState.merge({
        showUpdateSuccessMessage: false,
        showUpdateFailMessage: true,
        memberUpdateSuccessMessage: 'Error saving member permissions',
      });
    }

    this.membershipsPageState.membersState.merge({ submitting: false, membersToUpdate: [] });
  }

  //
  // app client members
  //

  onAppClientMemberSelectionChange(data: DocumentSpaceAppClientResponseDto, selectionEvent: GridSelectionType): void {
    if (selectionEvent === 'selected') {
      this.addAppClientMemberToDeleteState(data);
    } else {
      this.removeAppClientMemberFromDeleteState(data.appClientId);
    }
  }

  onAppClientDatasourceUpdateCallback(): void {
    this.membershipsPageState.appClientsDatasourceState.merge({
      shouldUpdateDatasource: false,
    });
  }

  async onAppClientMemberDeleteConfirmation(documentSpaceId: string, mounted: boolean) {
    try {
      // remove each selected app client
      for (const client of this.membershipsPageState.appClientMembersState.selected.value) {
        await this.membershipsService.removeDocumentSpaceAppClientMember(documentSpaceId, client.appClientId);
      }

      // Refresh the member list
      // Clean up state
      if (mounted) {
        this.onMemberChangeCallback();
        createTextToast(
          ToastType.SUCCESS,
          `Deleted (${this.membershipsPageState.appClientMembersState.selected.value.length}) App Client from Document Space`
        );

        this.resetMemberState();
      }
    } catch (err) {
      const preparedError = prepareRequestError(err);

      if (mounted) {
        createTextToast(ToastType.ERROR, preparedError.message);
      }
    }
  }

  addAppClientMemberToDeleteState(row: DocumentSpaceAppClientResponseDto): void {
    if (
      this.membershipsPageState.appClientMembersState.selected.value &&
      !this.membershipsPageState.appClientMembersState.selected.value.find((i) => i.appClientId === row.appClientId)
    ) {
      this.membershipsPageState.appClientMembersState.selected.merge([row]);
    }
  }

  removeAppClientMemberFromDeleteState(id: string): void {
    this.membershipsPageState.appClientMembersState.selected.find((member) => member.value.appClientId === id)?.set(none);
  }

  // for a given priv change from app client member-management list, add the changed appClient to membersToUpdateState
  onAppClientMemberPrivilegeDropDownChanged(row: DocumentSpaceAppClientResponseDto, item: string): void {
    const memberUpdateIndex = this.membershipsPageState.appClientMembersState.membersToUpdate.value.findIndex(
      (i) => i.appClientId === row.appClientId
    );
    if (memberUpdateIndex === -1) {
      this.membershipsPageState.appClientMembersState.membersToUpdate.merge([
        {
          appClientId: row.appClientId,
          privileges: unResolvePrivName(
            item
          ) as DocumentSpaceAppClientMemberRequestDtoPrivilegesEnum[],
        },
      ]);
    } else {
      // we've already staged this member for an update, so update existing pending-update
      this.membershipsPageState.appClientMembersState.membersToUpdate[memberUpdateIndex].set({
        appClientId: row.appClientId,
        privileges: unResolvePrivName(item) as DocumentSpaceAppClientMemberRequestDtoPrivilegesEnum[],
      });
    }
  }

  deleteAppClientMemberRow(row: DocumentSpaceAppClientResponseDto): void {
    this.addAppClientMemberToDeleteState(row);
    this.membershipsPageState.appClientMembersState.deletionState.isConfirmationOpen.set(true);
  }

  async saveAppClientMembers(documentSpaceId: string, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      this.membershipsPageState.appClientMembersState.merge({ submitting: true });
      for (const member of this.membershipsPageState.appClientMembersState.membersToUpdate.get()) {
        await this.membershipsService.addDocumentSpaceAppClientMember(documentSpaceId, member);
      }

      this.membershipsPageState.appClientMembersState.merge({
        showUpdateFailMessage: false,
        showUpdateSuccessMessage: true,
        memberUpdateSuccessMessage: 'App Client Members Updated',
      });
      
    } catch (e) {
      this.membershipsPageState.appClientMembersState.merge({
        showUpdateSuccessMessage: false,
        showUpdateFailMessage: true,
        memberUpdateSuccessMessage: 'Error saving App Client member permissions',
      });
    }

    this.onMemberChangeCallback();
    this.membershipsPageState.appClientMembersState.merge({ submitting: false, membersToUpdate: [] });
  }

  resetBatchUploadState() {
    this.batchUploadState.set({
      successErrorState: {
        successMessage: 'Successfully added members to Document Space',
        errorMessage: '',
        showSuccessMessage: false,
        showErrorMessage: false,
        showCloseButton: true,
      }
    });
  }

  // called whenever something member-related changed (new member, appclient, deletion, etc)
  // so we can refresh the ag-grids
  onMemberChangeCallback() {
    this.membershipsPageState.datasourceState.shouldUpdateDatasource.set(true);
    this.membershipsPageState.appClientsDatasourceState.shouldUpdateDatasource.set(true);
  }

  resetState() {
    this.membershipsPageState.set({
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
    
    this.resetBatchUploadState();
  }

}