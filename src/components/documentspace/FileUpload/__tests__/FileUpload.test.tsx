import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { fireEvent, render, waitFor } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';
import { DocumentSpaceControllerApi, DocumentSpaceControllerApiInterface, DocumentSpaceResponseDto, } from '../../../../openapi';
import DocumentSpaceService from '../../../../state/document-space/document-space-service';
import { useDocumentSpaceState } from '../../../../state/document-space/document-space-state';
import { createAxiosSuccessResponse } from '../../../../utils/TestUtils/test-utils';
import FileUpload from '../FileUpload';
import { createRef } from 'react';

jest.mock('../../../../state/document-space/document-space-state');

describe('File Upload Tests', () => {
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
    const response = createAxiosSuccessResponse<{ [key: string]: string }>({ message: 'good' });
    const uploadMock = jest.spyOn(documentSpaceService, 'uploadFile').mockReturnValue({
      promise: Promise.resolve(response),
      cancelTokenSource: axios.CancelToken.source()
    });

    const mock = jest.fn();

    const uploadFileRef = createRef<HTMLInputElement>();

    const page = render(<MemoryRouter>
      <FileUpload
        documentSpaceId='test'
        currentPath={''}
        onFinish={mock}
        ref={uploadFileRef}
      />
    </MemoryRouter>);

    uploadFileRef.current?.click();

    await waitFor(() => expect(page.getByTestId('file-uploader-input')).toBeInTheDocument());
    // simulate ulpoad event and wait until finish 
    await waitFor(() =>
      fireEvent.change(page.getByTestId('file-uploader-input'), {
        target: { files: ['some-file'] },
      })
    );

    expect(mock).toHaveBeenCalled();
    expect(uploadMock).toHaveBeenCalledTimes(1);
  });
});
