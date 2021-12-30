import { createState, State, useState } from '@hookstate/core';
import { DocumentSpaceControllerApi, DocumentSpaceControllerApiInterface, DocumentSpacePrivilegeDtoTypeEnum, DocumentSpaceResponseDto } from '../../openapi';
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
import { CreateEditOperationType } from './document-space-utils';
import { SideDrawerSize } from '../../components/SideDrawer/side-drawer-size';
import { SpacesPageState } from './spaces-page/spaces-page-state';
import SpacesPageService from './spaces-page/spaces-page-service';

const spacesState = createState<DocumentSpaceResponseDto[]>(new Array<DocumentSpaceResponseDto>());
const privilegeState = createState<Record<string, Record<DocumentSpacePrivilegeDtoTypeEnum, boolean>>>({});

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
  spaceNotFound: false,
  showFolderSizeDialog: false,
  selectedItemForSize: undefined,
});

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
  documentSpacePrivilegesService: DocumentSpacePrivilegeService) => {
  return new SpacesPageService(
    spacesServiceState,
    mountedRef,
    authorizedUserService,
    documentSpaceGlobalService,
    documentSpaceService,
    documentSpacePrivilegesService);
}

export const useDocumentSpacePageState = (mountedRef: MutableRefObject<boolean>) => wrapDocumentSpacePageState(
  useState(spacesPageState),
  mountedRef,
  accessAuthorizedUserState(),
  accessDocumentSpaceGlobalState(),
  accessDocumentSpaceState(),
  accessDocumentSpacePrivilegesState()
);

const wrapGlobalDocumentSpaceState = (globalState: State<DocumentSpaceGlobalState>) => {
  return new DocumentSpaceGlobalService(globalState)
}

export const useDocumentSpaceGlobalState = () => wrapGlobalDocumentSpaceState(useState(globalDocumentSpaceState));
export const accessDocumentSpaceGlobalState = () => wrapGlobalDocumentSpaceState(globalDocumentSpaceState);