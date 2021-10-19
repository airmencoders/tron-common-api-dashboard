import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { fireEvent, render, waitFor } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';
import { DocumentSpaceControllerApi, DocumentSpaceControllerApiInterface, DocumentSpaceResponseDto, } from '../../../openapi';
import DocumentSpaceService from '../../../state/document-space/document-space-service';
import { useDocumentSpaceState } from '../../../state/document-space/document-space-state';
import { createAxiosSuccessResponse } from '../../../utils/TestUtils/test-utils';
import DocumentUploadDialog from '../DocumentUploadDialog';

jest.mock('../../../state/document-space/document-space-state');

describe('Document Upload Tests', () => {

  let documentSpacesState: State<DocumentSpaceResponseDto[]> & StateMethodsDestroy;
  let documentSpaceApi: DocumentSpaceControllerApiInterface;
  let documentSpaceService: DocumentSpaceService;

  beforeEach(() => {
    documentSpacesState = createState<DocumentSpaceResponseDto[]>([]);
    documentSpaceApi = new DocumentSpaceControllerApi();
    documentSpaceService = new DocumentSpaceService(documentSpaceApi, documentSpacesState);

    (useDocumentSpaceState as jest.Mock).mockReturnValue(documentSpaceService);
  });

  it('should render and fire appropriate events', async () => {
    const response = createAxiosSuccessResponse<{[key:string]:string}>({ message: 'good'});
    const uploadMock = jest.spyOn(documentSpaceService, 'uploadFile').mockReturnValue({ promise: Promise.resolve(response), 
      cancelTokenSource: axios.CancelToken.source() });

    const mock = jest.fn();
    const page = render(<MemoryRouter>
      <DocumentUploadDialog 
        documentSpaceId='test'
        currentPath={''}
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

function CancellableDataRequest<T>(): import("../../../utils/cancellable-data-request").CancellableDataRequest<import("axios").AxiosResponse<{ [key: string]: string; }>> {
  throw new Error('Function not implemented.');
}
