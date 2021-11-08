import { createState, State, useState } from '@hookstate/core';
import { Configuration, DocumentSpaceControllerApi, DocumentSpaceControllerApiInterface, DocumentSpacePrivilegeDtoTypeEnum, DocumentSpaceResponseDto } from '../../openapi';
import Config from '../../api/config';
import DocumentSpaceService from './document-space-service';
import DocumentSpaceMembershipService from './document-space-membership-service';
import DocumentSpacePrivilegeService from './document-space-privilege-service';

const spacesState = createState<DocumentSpaceResponseDto[]>(new Array<DocumentSpaceResponseDto>());

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
  new Configuration({ basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX })
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
