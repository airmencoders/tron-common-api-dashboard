import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { DocumentSpaceControllerApi, DocumentSpaceControllerApiInterface, DocumentSpaceResponseDto } from '../../../openapi';
import DocumentSpaceGlobalService, { DocumentSpaceGlobalState } from '../../../state/document-space/document-space-global-service';
import DocumentSpaceService from '../../../state/document-space/document-space-service';
import { useDocumentSpaceGlobalState, useDocumentSpaceState } from '../../../state/document-space/document-space-state';
import FolderSizeDialog from '../FolderSizeDialog';

jest.mock('../../../state/document-space/document-space-state');

describe ('Get Folder Size Tests', () => {
  let documentSpacesState: State<DocumentSpaceResponseDto[]> & StateMethodsDestroy;
  let documentSpaceApi: DocumentSpaceControllerApiInterface;
  let documentSpaceService: DocumentSpaceService;
  let globalDocumentSpaceState: State<DocumentSpaceGlobalState>;
  let globalDocumentSpaceService: DocumentSpaceGlobalService;

  beforeEach(() => {
    documentSpacesState = createState<DocumentSpaceResponseDto[]>([]);
    documentSpaceApi = new DocumentSpaceControllerApi();
    documentSpaceService = new DocumentSpaceService(documentSpaceApi, documentSpacesState);

    globalDocumentSpaceState = createState<DocumentSpaceGlobalState>({
      currentDocumentSpace: undefined
    });
    globalDocumentSpaceService = new DocumentSpaceGlobalService(globalDocumentSpaceState);

    (useDocumentSpaceState as jest.Mock).mockReturnValue(documentSpaceService);
    (useDocumentSpaceGlobalState as jest.Mock).mockReturnValue(globalDocumentSpaceService);
  });

  it('renders ok', async () => {
    const closeMock = jest.fn();
    const deleteMock = jest.fn();

    jest.spyOn(documentSpaceService, 'getFolderSize')
      .mockReturnValue(Promise.resolve({ count: 20, size: 20, documentSpaceId: 'some id', itemName: 'folder', itemId: '1'}));

    const page = render(<FolderSizeDialog
      spaceId='1'
      onClose={closeMock}
      folderPath='/some/folder'
      show={true}
    />);

    await waitFor(() => expect(page.getByText('Folder Size')).toBeVisible());   
  });
})