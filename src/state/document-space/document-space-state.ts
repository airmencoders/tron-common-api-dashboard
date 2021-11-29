import { createState, State, useState } from '@hookstate/core';
import { DocumentSpaceControllerApi, DocumentSpaceControllerApiInterface, DocumentSpacePrivilegeDtoTypeEnum, DocumentSpaceResponseDto } from '../../openapi';
import DocumentSpaceService from './document-space-service';
import DocumentSpaceMembershipService from './document-space-membership-service';
import { globalOpenapiConfig } from '../../api/openapi-config';
import DocumentSpacePrivilegeService from './document-space-privilege-service';
import { RecentsPageState } from './recents-page/recents-page-state';
import RecentsPageService from './recents-page/recents-page-service';
import React, { MutableRefObject } from 'react';
import DocumentSpaceDownloadUrlService from './document-space-download-url-service';
import { accessAuthorizedUserState } from '../authorized-user/authorized-user-state';
import AuthorizedUserService from '../authorized-user/authorized-user-service';

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
