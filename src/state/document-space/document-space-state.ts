import { createState, State, useState } from '@hookstate/core';
import { Configuration, DocumentDto, DocumentSpaceControllerApi, DocumentSpaceControllerApiInterface, DocumentSpaceInfoDto } from '../../openapi';
import Config from '../../api/config';
import DocumentSpaceService from './document-space-service';

const documentFilesState = createState<DocumentDto[]>(new Array<DocumentDto>());
const documentSpacesState = createState<DocumentSpaceInfoDto[]>(new Array<DocumentSpaceInfoDto>());

const documentSpaceApi: DocumentSpaceControllerApiInterface = new DocumentSpaceControllerApi(
  new Configuration({ basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX })
);

export const wrapState = (
  documentFilesState: State<DocumentDto[]>,
  documentSpacesState: State<DocumentSpaceInfoDto[]>,
  documentSpaceApi: DocumentSpaceControllerApiInterface) => {
  return new DocumentSpaceService(
    documentFilesState,
    documentSpacesState,
    documentSpaceApi
  );
}

export const useDocumentSpaceState = () => wrapState(
  useState(documentFilesState),
  useState(documentSpacesState),
  documentSpaceApi
);
