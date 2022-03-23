import { createState, State, useState } from '@hookstate/core';
import { DocumentSpaceControllerApi, DocumentSpaceControllerApiInterface, DocumentSpacePrivilegeDtoTypeEnum, DocumentSpaceResponseDto, RecentDocumentDto } from '../../openapi';
import DocumentSpaceService from './document-space-service';
import DocumentSpaceMembershipService from './memberships/document-space-membership-service';
import { globalOpenapiConfig } from '../../api/openapi-config';
import DocumentSpacePrivilegeService from './document-space-privilege-service';
import { RecentsPageState } from './recents-page/recents-page-state';
import RecentsPageService from './recents-page/recents-page-service';
import React, { MutableRefObject } from 'react';
import DocumentSpaceDownloadUrlService from './document-space-download-url-service';
import { accessAuthorizedUserState } from '../authorized-user/authorized-user-state';
import AuthorizedUserService from '../authorized-user/authorized-user-service';
import DocumentSpaceGlobalService, { DocumentSpaceGlobalState } from './document-space-global-service';
import { SideDrawerSize } from '../../components/SideDrawer/side-drawer-size';
import { SpacesPageState } from './spaces-page/spaces-page-state';
import SpacesPageService from './spaces-page/spaces-page-service';
import { CreateEditOperationType } from '../../utils/document-space-utils';
import { BatchUploadState, DocumentSpaceMembershipsState } from './memberships-page/memberships-page-state';
import DocumentSpaceMembershipsPageService from './memberships-page/memberships-page-service';

/**
 * Holds all state objects (hookstate global states) used by all the document space pages/services
 */

const spacesState = createState<DocumentSpaceResponseDto[]>(new Array<DocumentSpaceResponseDto>());
const privilegeState = createState<Record<string, Record<DocumentSpacePrivilegeDtoTypeEnum, boolean>>>({});

// the clipboard global state for cut/copy/paste operations
export interface ClipBoardState {
  sourceSpace?: string;  // space where we initiated the cut/copy
  isCopy: boolean;  // copy or cut?
  items: string[];
}
export const clipBoardState = createState<ClipBoardState | undefined>(undefined);


const recentsPageState = createState<RecentsPageState>({
  datasource: undefined,
  shouldUpdateInfiniteCache: false,
  selectedFile: undefined,
  showDeleteDialog: false,
  renameFormState: {
    isSubmitting: false,
    isOpen: false
  },
  pageStatus: {
    isLoading: false,
    isError: false,
    message: undefined
  }
});

const spacesPageState = createState<SpacesPageState>({
  drawerOpen: false,
  isSubmitting: false,
  showErrorMessage: false,
  errorMessage: '',
  selectedSpace: undefined,
  shouldUpdateDatasource: false,
  datasource: undefined,
  shouldUpdateRecentsDatasource: false,
  recentsDatasource: undefined,
  shouldUpdateSearchDatasource: false,
  searchDatasource: undefined,
  showUploadDialog: false,
  showDeleteDialog: false,
  fileToDelete: '',
  selectedFile: undefined,
  selectedFiles: [],
  membershipsState: {
    isOpen: false
  },
  createEditElementOpType: CreateEditOperationType.NONE,
  path: '',
  showDeleteSelectedDialog: false,
  isDefaultDocumentSpaceSettingsOpen: false,
  sideDrawerSize: SideDrawerSize.WIDE,
  favorites: [],
  showNoChosenSpace: false,
  spaceNotFound: false,
  showFolderSizeDialog: false,
  selectedItemForSize: undefined,
  searchQuery: undefined,
});

const membershipsPageState = createState<DocumentSpaceMembershipsState>({
  datasourceState: {
    datasource: undefined,
    shouldUpdateDatasource: false,
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
    shouldUpdateDatasource: false,
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

const batchUploadState = createState<BatchUploadState>({
  successErrorState: {
    successMessage: 'Successfully added members to Document Space',
    errorMessage: '',
    showSuccessMessage: false,
    showErrorMessage: false,
    showCloseButton: true,
  },
}); 

const wrapDocumentSpaceMembershipsPageState = (
  membershipPageState: State<DocumentSpaceMembershipsState>,
  uploadState: State<BatchUploadState>,
  membershipsService: DocumentSpaceMembershipService) => {
    return new DocumentSpaceMembershipsPageService(membershipPageState, uploadState, membershipsService);
  }

export const useDocumentSpaceMembershipsPageState = () => wrapDocumentSpaceMembershipsPageState(
  useState(membershipsPageState),
  useState(batchUploadState),
  documentSpaceMembershipService()
);

const globalDocumentSpaceState = createState<DocumentSpaceGlobalState>({
  currentDocumentSpace: undefined
});

const documentSpaceControllerApi: DocumentSpaceControllerApiInterface = new DocumentSpaceControllerApi(
  globalOpenapiConfig.configuration,
  globalOpenapiConfig.basePath,
  globalOpenapiConfig.axios
);

export const documentSpaceMembershipService = () => new DocumentSpaceMembershipService(documentSpaceControllerApi);
export const documentSpaceDownloadUrlService = () => new DocumentSpaceDownloadUrlService();

const wrapDocumentSpaceState = (
  documentSpaceApi: DocumentSpaceControllerApiInterface,
  documentSpacesState: State<DocumentSpaceResponseDto[]>) => {
  return new DocumentSpaceService(
    documentSpaceApi,
    documentSpacesState
  );
}

export const useDocumentSpaceState = () => wrapDocumentSpaceState(
  documentSpaceControllerApi,
  useState(spacesState)
);

export const accessDocumentSpaceState = () => wrapDocumentSpaceState(
  documentSpaceControllerApi,
  spacesState
);

const wrapDocumentSpacePrivilegesState = (
  documentSpaceApi: DocumentSpaceControllerApiInterface,
  documentSpacePrivilegeState: State<Record<string, Record<DocumentSpacePrivilegeDtoTypeEnum, boolean>>>) => {
  return new DocumentSpacePrivilegeService(
    documentSpaceApi,
    documentSpacePrivilegeState
  );
};

export const useDocumentSpacePrivilegesState = () => wrapDocumentSpacePrivilegesState(
  documentSpaceControllerApi,
  useState(privilegeState)
);

export const accessDocumentSpacePrivilegesState = () => wrapDocumentSpacePrivilegesState(
  documentSpaceControllerApi,
  privilegeState
);

const wrapDocumentSpaceRecentsPageState = (
  documentSpaceApi: DocumentSpaceControllerApiInterface,
  recentsState: State<RecentsPageState>,
  mountedRef: MutableRefObject<boolean>,
  authorizedUserService: AuthorizedUserService,
  documentSpaceService: DocumentSpaceService,
  documentSpacePrivilegesService: DocumentSpacePrivilegeService) => {
  return new RecentsPageService(
    documentSpaceApi,
    recentsState,
    mountedRef,
    authorizedUserService,
    documentSpaceService,
    documentSpacePrivilegesService);
}

export const useDocumentSpaceRecentsPageState = (mountedRef: MutableRefObject<boolean>) => wrapDocumentSpaceRecentsPageState(
  documentSpaceControllerApi,
  useState(recentsPageState),
  mountedRef,
  accessAuthorizedUserState(),
  accessDocumentSpaceState(),
  accessDocumentSpacePrivilegesState()
);

const wrapDocumentSpacePageState = (
  spacesServiceState: State<SpacesPageState>,
  mountedRef: MutableRefObject<boolean>,
  authorizedUserService: AuthorizedUserService,
  documentSpaceGlobalService: DocumentSpaceGlobalService,
  documentSpaceService: DocumentSpaceService,
  documentSpacePrivilegesService: DocumentSpacePrivilegeService,
  documentSpaceClipboardState: State<ClipBoardState | undefined>) => {
  return new SpacesPageService(
    spacesServiceState,
    mountedRef,
    authorizedUserService,
    documentSpaceGlobalService,
    documentSpaceService,
    documentSpacePrivilegesService,
    documentSpaceClipboardState);
}

export const useDocumentSpacePageState = (mountedRef: MutableRefObject<boolean>) => wrapDocumentSpacePageState(
  useState(spacesPageState),
  mountedRef,
  accessAuthorizedUserState(),
  accessDocumentSpaceGlobalState(),
  accessDocumentSpaceState(),
  accessDocumentSpacePrivilegesState(),
  clipBoardState
);

const wrapGlobalDocumentSpaceState = (globalState: State<DocumentSpaceGlobalState>) => {
  return new DocumentSpaceGlobalService(globalState)
}

export const useDocumentSpaceGlobalState = () => wrapGlobalDocumentSpaceState(useState(globalDocumentSpaceState));
export const accessDocumentSpaceGlobalState = () => wrapGlobalDocumentSpaceState(globalDocumentSpaceState);