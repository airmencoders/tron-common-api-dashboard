import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DocumentSpaceControllerApi, DocumentSpaceControllerApiInterface, DocumentSpaceInfoDto } from '../../../openapi';
import DocumentSpaceService from '../../../state/document-space/document-space-service';
import { useDocumentSpaceState } from '../../../state/document-space/document-space-state';
import DocumentUploadDialog from '../DocumentUploadDialog';

jest.mock('../../../state/document-space/document-space-state');

describe('Document Upload Tests', () => {

  let documentSpacesState: State<DocumentSpaceInfoDto[]> & StateMethodsDestroy;
  let documentSpaceApi: DocumentSpaceControllerApiInterface;
  let documentSpaceService: DocumentSpaceService;

  beforeEach(() => {
    documentSpacesState = createState<DocumentSpaceInfoDto[]>([]);
    documentSpaceApi = new DocumentSpaceControllerApi();
    documentSpaceService = new DocumentSpaceService(documentSpaceApi, documentSpacesState);

    (useDocumentSpaceState as jest.Mock).mockReturnValue(documentSpaceService);
  });

  it('should render and fire appropriate events', async () => {
    const uploadMock = jest.spyOn(documentSpaceService, 'uploadFile').mockReturnValue(Promise.resolve());

    const mock = jest.fn();
    const page = render(<MemoryRouter>
      <DocumentUploadDialog 
        onFinish={mock} 
      />
    </MemoryRouter>);

    const btn = page.getByTestId('upload-file__btn');
    fireEvent.click(btn);
    await waitFor(() => expect(page.getByTestId('file-uploader-input')).toBeInTheDocument());
    // simulate ulpoad event and wait until finish 
    await waitFor(() =>
      fireEvent.change(page.getByTestId('file-uploader-input'), {
        target: { files: [ 'some-file' ] },
      })
    );

    expect(mock).toHaveBeenCalled();
    expect(uploadMock).toHaveBeenCalledTimes(1);
  });
})