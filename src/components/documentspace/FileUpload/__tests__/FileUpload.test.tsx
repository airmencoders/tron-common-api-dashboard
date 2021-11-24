import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { fireEvent, render, waitFor , screen, act} from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';
import { DocumentSpaceControllerApi, DocumentSpaceControllerApiInterface, DocumentSpaceResponseDto, } from '../../../../openapi';
import DocumentSpaceService from '../../../../state/document-space/document-space-service';
import { useDocumentSpaceState } from '../../../../state/document-space/document-space-state';
import { createAxiosSuccessResponse } from '../../../../utils/TestUtils/test-utils';
import FileUpload from '../FileUpload';
import { createRef } from 'react';
import { _ } from 'ag-grid-community';

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

  it('should render and fire appropriate events - Prompt Always mode - Yes Answer', async () => {
    const response = createAxiosSuccessResponse<{ [key: string]: string }>({ message: 'good' });
    const uploadMock = jest.spyOn(documentSpaceService, 'uploadFile').mockReturnValue({
      promise: Promise.resolve(response),
      cancelTokenSource: axios.CancelToken.source()
    });

    jest.spyOn(documentSpaceService, 'checkIfFileExistsAtPath')
      .mockReturnValue(Promise.resolve([ 'some-file', 'some-file2' ]));

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

    mock.mockReset();

    uploadFileRef.current?.click();

    await waitFor(() => expect(page.getByTestId('file-uploader-input')).toBeInTheDocument());
    await waitFor(() =>
      fireEvent.change(page.getByTestId('file-uploader-input'), {
        target: { files: [ { name: 'some-file' }, { name: 'some-file2' }] },
      })
    );

    // confirm we have a prompt displayed each time
    await waitFor(() => expect(screen.getByText('Yes')).toBeInTheDocument());

    // click the Yes to overwrite
    fireEvent.click(screen.getByText('Yes'));

    // confirm we have a prompt displayed each time
    await waitFor(() => expect(screen.getByText('Yes')).toBeInTheDocument());

    // click the Yes to overwrite
    fireEvent.click(screen.getByText('Yes'));

    await waitFor(() => expect(mock).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(uploadMock).toHaveBeenCalledTimes(2));
  });

  it('should render and fire appropriate events - No Conflicts', async () => {
    const response = createAxiosSuccessResponse<{ [key: string]: string }>({ message: 'good' });
    const uploadMock = jest.spyOn(documentSpaceService, 'uploadFile').mockReturnValue({
      promise: Promise.resolve(response),
      cancelTokenSource: axios.CancelToken.source()
    });

    jest.spyOn(documentSpaceService, 'checkIfFileExistsAtPath')
      .mockReturnValue(Promise.resolve([ ]));

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

    mock.mockReset();

    uploadFileRef.current?.click();

    await waitFor(() => expect(page.getByTestId('file-uploader-input')).toBeInTheDocument());
    await waitFor(() =>
      fireEvent.change(page.getByTestId('file-uploader-input'), {
        target: { files: [ { name: 'some-file' }, { name: 'some-file2' }] },
      })
    );

    await waitFor(() => expect(mock).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(uploadMock).toHaveBeenCalledTimes(2));
  });

  it('should render and fire appropriate events - Replace All mode', async () => {
    const response = createAxiosSuccessResponse<{ [key: string]: string }>({ message: 'good' });
    const uploadMock = jest.spyOn(documentSpaceService, 'uploadFile').mockReturnValue({
      promise: Promise.resolve(response),
      cancelTokenSource: axios.CancelToken.source()
    });

    jest.spyOn(documentSpaceService, 'checkIfFileExistsAtPath')
      .mockReturnValue(Promise.resolve([ 'some-file', 'some-file2' ]));

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

    mock.mockReset();

    uploadFileRef.current?.click();

    await waitFor(() => expect(page.getByTestId('file-uploader-input')).toBeInTheDocument());
    await waitFor(() =>
      fireEvent.change(page.getByTestId('file-uploader-input'), {
        target: { files: [ { name: 'some-file' }, { name: 'some-file2' }] },
      })
    );

    // confirm we have a prompt displayed
    await waitFor(() => expect(screen.getByText('Yes to All')).toBeInTheDocument());

    // click the Yes to overwrite
    fireEvent.click(screen.getByText('Yes to All'));

    await waitFor(() => expect(mock).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(uploadMock).toHaveBeenCalledTimes(2));
  });

  it('should render and fire appropriate events - Replace All mode', async () => {
    const response = createAxiosSuccessResponse<{ [key: string]: string }>({ message: 'good' });
    const uploadMock = jest.spyOn(documentSpaceService, 'uploadFile').mockReturnValue({
      promise: Promise.resolve(response),
      cancelTokenSource: axios.CancelToken.source()
    });

    jest.spyOn(documentSpaceService, 'checkIfFileExistsAtPath')
      .mockReturnValue(Promise.resolve([ 'some-file', 'some-file2' ]));

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

    mock.mockReset();

    uploadFileRef.current?.click();

    await waitFor(() => expect(page.getByTestId('file-uploader-input')).toBeInTheDocument());
    await waitFor(() =>
      fireEvent.change(page.getByTestId('file-uploader-input'), {
        target: { files: [ { name: 'some-file' }, { name: 'some-file2' }] },
      })
    );

    // confirm we have a prompt displayed
    await waitFor(() => expect(screen.getByText('Yes to All')).toBeInTheDocument());

    // click the Yes to overwrite
    fireEvent.click(screen.getByText('Yes to All'));

    await waitFor(() => expect(mock).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(uploadMock).toHaveBeenCalledTimes(2));
  });

  it('should render and fire appropriate events - Replace None mode', async () => {
    const response = createAxiosSuccessResponse<{ [key: string]: string }>({ message: 'good' });
    const uploadMock = jest.spyOn(documentSpaceService, 'uploadFile').mockReturnValue({
      promise: Promise.resolve(response),
      cancelTokenSource: axios.CancelToken.source()
    });

    jest.spyOn(documentSpaceService, 'checkIfFileExistsAtPath')
      .mockReturnValue(Promise.resolve([ 'some-file', 'some-file2' ]));

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

    mock.mockReset();

    uploadFileRef.current?.click();

    await waitFor(() => expect(page.getByTestId('file-uploader-input')).toBeInTheDocument());
    await waitFor(() =>
      fireEvent.change(page.getByTestId('file-uploader-input'), {
        target: { files: [ { name: 'some-file' }, { name: 'some-file2' }] },
      })
    );

    // confirm we have a prompt displayed
    await waitFor(() => expect(screen.getByText('No to All')).toBeInTheDocument());

    // click the Yes to overwrite
    fireEvent.click(screen.getByText('No to All'));

    await waitFor(() => expect(mock).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(uploadMock).toHaveBeenCalledTimes(0));
  });

  it('should render and fire appropriate events - Prompt All mode - No Answer', async () => {
    const response = createAxiosSuccessResponse<{ [key: string]: string }>({ message: 'good' });
    const uploadMock = jest.spyOn(documentSpaceService, 'uploadFile').mockReturnValue({
      promise: Promise.resolve(response),
      cancelTokenSource: axios.CancelToken.source()
    });

    jest.spyOn(documentSpaceService, 'checkIfFileExistsAtPath')
      .mockReturnValue(Promise.resolve([ 'some-file', 'some-file2' ]));

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

    mock.mockReset();

    uploadFileRef.current?.click();

    await waitFor(() => expect(page.getByTestId('file-uploader-input')).toBeInTheDocument());
    await waitFor(() =>
      fireEvent.change(page.getByTestId('file-uploader-input'), {
        target: { files: [ { name: 'some-file' }, { name: 'some-file2' }] },
      })
    );

    // confirm we have a prompt displayed
    await waitFor(() => expect(screen.getByText('No')).toBeInTheDocument());

    // click the Yes to overwrite
    fireEvent.click(screen.getByText('No'));

    // confirm we have a prompt displayed
    await waitFor(() => expect(screen.getByText('No')).toBeInTheDocument());

    // click the Yes to overwrite
    fireEvent.click(screen.getByText('No'));

    await waitFor(() => expect(mock).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(uploadMock).toHaveBeenCalledTimes(0));
  });
});
