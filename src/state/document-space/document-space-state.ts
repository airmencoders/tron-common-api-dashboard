import { createState, State, useState } from '@hookstate/core';
import { DocumentSpaceControllerApi, DocumentSpaceControllerApiInterface, DocumentSpaceResponseDto } from '../../openapi';
import DocumentSpaceService from './document-space-service';
import DocumentSpaceMembershipService from './document-space-membership-service';
import { globalOpenapiConfig } from '../../api/openapi-config';

const spacesState = createState<DocumentSpaceResponseDto[]>(new Array<DocumentSpaceResponseDto>());
const documentSpaceControllerApi: DocumentSpaceControllerApiInterface = new DocumentSpaceControllerApi(
  globalOpenapiConfig.configuration,
  globalOpenapiConfig.basePath,
  globalOpenapiConfig.axios
);

export const wrapState = (
  documentSpaceApi: DocumentSpaceControllerApiInterface,
  documentSpacesState: State<DocumentSpaceResponseDto[]>) => {
  return new DocumentSpaceService(
    documentSpaceApi,
    documentSpacesState
  );
}

export const useDocumentSpaceState = () => wrapState(
  documentSpaceControllerApi,
  useState(spacesState)
);

export const documentSpaceMembershipService = () => new DocumentSpaceMembershipService(documentSpaceControllerApi);
