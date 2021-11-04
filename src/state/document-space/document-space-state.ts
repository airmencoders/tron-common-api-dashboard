import { createState, State, useState } from '@hookstate/core';
import { Configuration, DocumentSpaceControllerApi, DocumentSpaceControllerApiInterface, DocumentSpaceResponseDto } from '../../openapi';
import Config from '../../api/config';
import DocumentSpaceService from './document-space-service';
import DocumentSpaceMembershipService from './document-space-membership-service';
import { openapiAxiosInstance } from '../../api/openapi-axios';

const spacesState = createState<DocumentSpaceResponseDto[]>(new Array<DocumentSpaceResponseDto>());
const documentSpaceControllerApi: DocumentSpaceControllerApiInterface = new DocumentSpaceControllerApi(
  new Configuration({ basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX }), '', openapiAxiosInstance
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
