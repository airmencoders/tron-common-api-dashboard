import { IDatasource } from "ag-grid-community";
import { SuccessErrorMessageProps } from "../../../components/forms/SuccessErrorMessage/SuccessErrorMessageProps";
import { DocumentSpaceAppClientMemberRequestDto, DocumentSpaceAppClientResponseDto, DocumentSpaceDashboardMemberRequestDto, DocumentSpaceDashboardMemberResponseDto } from "../../../openapi";

/**
 * State that is shared across the various tabs and forms of the Memberships page/component
 */

export interface DocumentSpaceMembershipsState {
  datasourceState: {
    datasource?: IDatasource;
    shouldUpdateDatasource: boolean;
  };
  membersState: {
    selected: DocumentSpaceDashboardMemberResponseDto[];
    deletionState: {
      isConfirmationOpen: boolean;
    };
    membersToUpdate: DocumentSpaceDashboardMemberRequestDto[];
    submitting: boolean;
    memberUpdateSuccessMessage: string;
    memberUpdateFailMessage: string;
    showUpdateFailMessage: boolean;
    showUpdateSuccessMessage: boolean;
  };
  appClientsDatasourceState: {
    datasource?: IDatasource;
    shouldUpdateDatasource: boolean;
  };
  appClientMembersState: {
    selected: DocumentSpaceAppClientResponseDto[];
    deletionState: {
      isConfirmationOpen: boolean;
    };
    membersToUpdate: DocumentSpaceAppClientMemberRequestDto[];
    submitting: boolean;
    memberUpdateSuccessMessage: string;
    memberUpdateFailMessage: string;
    showUpdateFailMessage: boolean;
    showUpdateSuccessMessage: boolean;
  };
  selectedTab: number;
}

export interface BatchUploadState {
  successErrorState: SuccessErrorMessageProps;
}
