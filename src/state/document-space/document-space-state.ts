import { createState, State, useState } from '@hookstate/core';
import { DocumentSpaceControllerApi, DocumentSpaceControllerApiInterface, DocumentSpacePrivilegeDtoTypeEnum, DocumentSpaceResponseDto } from '../../openapi';
import DocumentSpaceService from './document-space-service';
import DocumentSpaceMembershipService from './document-space-membership-service';
import { globalOpenapiConfig } from '../../api/openapi-config';
import DocumentSpacePrivilegeService from './document-space-privilege-service';

const spacesState = createState<DocumentSpaceResponseDto[]>(new Array<DocumentSpaceResponseDto>());

// holds the reduced list of document spaces with the current user's privs for that space 
//  (so we know if the user can be offered the delete/restore functionality on the ag-grid)
export const archivedItemsSpacesStates = createState<Record<string, Record<DocumentSpacePrivilegeDtoTypeEnum, boolean>>>({});

/**
 * Will take the form of:
 * {
 *    [documentSpaceId]: {
 *      READ: false,
 *      WRITE: false,
 *      MEMBERSHIP: false
 *    }
 * }
 */
const privilegeState = createState<Record<string, Record<DocumentSpacePrivilegeDtoTypeEnum, boolean>>>({});

const documentSpaceControllerApi: DocumentSpaceControllerApiInterface = new DocumentSpaceControllerApi(
  globalOpenapiConfig.configuration,
  globalOpenapiConfig.basePath,
  globalOpenapiConfig.axios
);

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

export const documentSpaceMembershipService = () => new DocumentSpaceMembershipService(documentSpaceControllerApi);

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
