import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { DocumentSpaceControllerApi, DocumentSpaceControllerApiInterface, DocumentSpaceResponseDto } from '../../../openapi';
import DocumentSpaceGlobalService, { DocumentSpaceGlobalState } from '../../../state/document-space/document-space-global-service';
import DocumentSpaceService from '../../../state/document-space/document-space-service';
import { useDocumentSpaceGlobalState, useDocumentSpaceState } from '../../../state/document-space/document-space-state';
import DeleteDocumentSpaceDialog from '../DeleteDocumentSpaceDialog';

jest.mock('../../../state/document-space/document-space-state');
describe ('Delete Document Space Dialog Tests', () => {
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

  it('should only let delete if typed name is correct', async () => {
    const closeMock = jest.fn();
    const deleteMock = jest.fn();

    jest.spyOn(documentSpaceService, 'deleteDocumentSpace').mockReturnValue(Promise.resolve());

    const page = render(<DeleteDocumentSpaceDialog
      docSpaceId='id1'
      docSpaceName='space1'
      onClose={closeMock}
      onDocumentSpaceDeleted={deleteMock}
      show={true}
    />);

    await waitFor(() => expect(page.getByTestId('delete-space-red-text')).toBeVisible());
    expect(page.getByTestId('modal-submit-btn')).toBeDisabled();

    fireEvent.change(page.getByTestId('document-space-removal-field'), { target: { value: 'space1' }});
    await waitFor(() => expect(page.getByTestId('modal-submit-btn')).not.toBeDisabled());
    fireEvent.click(page.getByTestId('modal-submit-btn'));
    await waitFor(() => expect(deleteMock).toHaveBeenCalled());

    fireEvent.click(page.getByTestId('modal-cancel-btn'));
    await waitFor(() => expect(closeMock).toHaveBeenCalled());
  });
})