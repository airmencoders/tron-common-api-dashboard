import { createState, State, useState } from '@hookstate/core';
import { Configuration, DocumentSpaceControllerApi, DocumentSpaceControllerApiInterface, DocumentSpaceInfoDto } from '../../openapi';
import Config from '../../api/config';
import DocumentSpaceService from './document-space-service';

const documentSpacesState = createState<DocumentSpaceInfoDto[]>(new Array<DocumentSpaceInfoDto>());

const documentSpaceApi: DocumentSpaceControllerApiInterface = new DocumentSpaceControllerApi(
  new Configuration({ basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX })
);

export const wrapState = (
  documentSpaceApi: DocumentSpaceControllerApiInterface,
  documentSpacesState: State<DocumentSpaceInfoDto[]>) => {
  return new DocumentSpaceService(
    documentSpaceApi,
    documentSpacesState
  );
}

export const useDocumentSpaceState = () => wrapState(
  documentSpaceApi,
  useState(documentSpacesState)
);
