import { createState, State } from '@hookstate/core';
import { AxiosResponse } from 'axios';
import { InfiniteScrollOptions } from '../../../components/DataCrudFormPage/infinite-scroll-options';
import { generateInfiniteScrollLimit } from '../../../components/Grid/GridUtils/grid-utils';
import {
  DocumentDto,
  DocumentSpaceControllerApi,
  DocumentSpaceControllerApiInterface,
  DocumentSpaceInfoDto,
  DocumentSpaceInfoDtoResponseWrapper,
  S3PaginationDto,
} from '../../../openapi';
import * as cancellableDataRequestImp from '../../../utils/cancellable-data-request';
import { RequestError } from '../../../utils/ErrorHandling/request-error';
import {
  createAxiosSuccessResponse,
  createGenericAxiosRequestErrorResponse,
} from '../../../utils/TestUtils/test-utils';
import DocumentSpaceService from '../document-space-service';

describe('Test Document Space Service', () => {
  const infiniteScrollOptions: InfiniteScrollOptions = {
    enabled: true,
    limit: 5,
  };

  const spaceName = 'somespace';

  const documents: DocumentDto[] = [
    {
      key: 'file.txt',
      path: spaceName,
      uploadedBy: '',
      uploadedDate: '2021-09-17T14:09:10.154Z',
    },
    {
      key: 'file2.txt',
      path: spaceName,
      uploadedBy: '',
      uploadedDate: '2021-09-17T15:09:10.154Z',
    },
  ];

  const listObjectsResponse: AxiosResponse<S3PaginationDto> = createAxiosSuccessResponse(
    {
      documents: documents,
      currentContinuationToken: '',
      nextContinuationToken: '',
      size: generateInfiniteScrollLimit(infiniteScrollOptions),
      totalElements: documents.length,
    }
  );

  const documentSpaces: DocumentSpaceInfoDto[] = [
    {
      name: 'space1',
    },
    {
      name: 'space2',
    },
  ];

  const getSpacesResponse: AxiosResponse<DocumentSpaceInfoDtoResponseWrapper> = createAxiosSuccessResponse(
    {
      data: documentSpaces,
    }
  );

  let documentSpacesState: State<DocumentSpaceInfoDto[]>;
  let documentSpaceApi: DocumentSpaceControllerApiInterface;
  let documentSpaceService: DocumentSpaceService;

  beforeEach(() => {
    documentSpacesState = createState<DocumentSpaceInfoDto[]>([]);
    documentSpaceApi = new DocumentSpaceControllerApi();
    documentSpaceService = new DocumentSpaceService(
      documentSpaceApi,
      documentSpacesState
    );
  });

  it('should create datasource and fetch documents', (done) => {
    documentSpaceApi.listObjects = jest.fn(() => {
      return Promise.resolve(listObjectsResponse);
    });

    const apiRequestSpy = jest.spyOn(documentSpaceApi, 'listObjects');

    const onSuccess = jest.fn((data, lastRow) => {
      try {
        expect(data).toEqual(
          expect.arrayContaining(listObjectsResponse.data.documents)
        );
        done();
      } catch (err) {
        done(err);
      }
    });
    const onFail = jest.fn();
    const datasource = documentSpaceService.createDatasource(
      spaceName,
      infiniteScrollOptions
    );
    datasource.getRows({
      successCallback: onSuccess,
      failCallback: onFail,
      startRow: 0,
      endRow: 100,
      sortModel: [],
      filterModel: {},
      context: undefined,
    });

    expect(apiRequestSpy).toHaveBeenCalledTimes(1);
  });

  it('should create datasource and fail on server error response', (done) => {
    const badRequestError = createGenericAxiosRequestErrorResponse(500);

    documentSpaceApi.listObjects = jest.fn(() => {
      return Promise.reject(badRequestError);
    });

    const apiRequestSpy = jest.spyOn(documentSpaceApi, 'listObjects');

    const onSuccess = jest.fn();
    const onFail = jest.fn(() => {
      try {
        done();
      } catch (err) {
        done(err);
      }
    });
    const datasource = documentSpaceService.createDatasource(
      spaceName,
      infiniteScrollOptions
    );
    datasource.getRows({
      successCallback: onSuccess,
      failCallback: onFail,
      startRow: 0,
      endRow: 100,
      sortModel: [],
      filterModel: {},
      context: undefined,
    });

    expect(apiRequestSpy).toHaveBeenCalledTimes(1);
  });

  it('should create datasource and fail on catch all', (done) => {
    documentSpaceApi.listObjects = jest.fn(() => {
      return Promise.reject(new Error('Catch all exception'));
    });

    const apiRequestSpy = jest.spyOn(documentSpaceApi, 'listObjects');

    const onSuccess = jest.fn();
    const onFail = jest.fn(() => {
      try {
        done();
      } catch (err) {
        done(err);
      }
    });
    const datasource = documentSpaceService.createDatasource(
      spaceName,
      infiniteScrollOptions
    );
    datasource.getRows({
      successCallback: onSuccess,
      failCallback: onFail,
      startRow: 0,
      endRow: 100,
      sortModel: [],
      filterModel: {},
      context: undefined,
    });

    expect(apiRequestSpy).toHaveBeenCalledTimes(1);
  });

  it('should fetch and store Document Spaces', async () => {
    documentSpaceApi.getSpaces = jest.fn(() => {
      return Promise.resolve(getSpacesResponse);
    });

    const apiRequestSpy = jest.spyOn(documentSpaceApi, 'getSpaces');

    const cancellableRequest = documentSpaceService.fetchAndStoreSpaces();
    expect(apiRequestSpy).toHaveBeenCalledTimes(1);

    const request = await cancellableRequest.promise;

    expect(request).toEqual(documentSpaces);
    expect(documentSpacesState.value).toEqual(documentSpaces);
  });

  it('should return empty array on cancelled fetch and store request for Document Spaces', async () => {
    documentSpaceApi.getSpaces = jest.fn(() => {
      return Promise.reject('');
    });

    const apiRequestSpy = jest.spyOn(documentSpaceApi, 'getSpaces');

    const cancelErrorSpy = jest.spyOn(
      cancellableDataRequestImp,
      'isDataRequestCancelError'
    );
    cancelErrorSpy.mockReturnValue(true);

    const cancellableRequest = documentSpaceService.fetchAndStoreSpaces();
    await cancellableRequest.promise;

    expect(apiRequestSpy).toHaveBeenCalledTimes(1);
    expect(cancelErrorSpy).toHaveBeenCalledTimes(1);

    expect(documentSpaceService.documentSpaces).toEqual([]);
  });

  it('should error out document space state when fetch and store request for Document Spaces rejects', async () => {
    const errorResponse = createGenericAxiosRequestErrorResponse();
    documentSpaceApi.getSpaces = jest.fn(() => {
      return Promise.reject(errorResponse);
    });

    const apiRequestSpy = jest.spyOn(documentSpaceApi, 'getSpaces');

    const cancellableRequest = documentSpaceService.fetchAndStoreSpaces();
    await expect(cancellableRequest.promise).rejects.toEqual({
      status: errorResponse.response.data.status,
      error: errorResponse.response.data.error,
      message: errorResponse.response.data.reason,
    } as RequestError);

    expect(apiRequestSpy).toHaveBeenCalledTimes(1);

    expect(documentSpaceService.isDocumentSpacesStateErrored).toEqual(true);
    expect(documentSpaceService.documentSpaces).toEqual([]);
  });

  it('should get promised status of Document Spaces States', async () => {
    jest.useFakeTimers();

    documentSpaceApi.getSpaces = jest.fn(() => {
      return new Promise((resolve) =>
        setTimeout(async () => {
          resolve(getSpacesResponse);
        }, 1000)
      );
    });

    expect(documentSpaceService.isDocumentSpacesStatePromised).toEqual(false);

    const cancellableRequest = documentSpaceService.fetchAndStoreSpaces();

    expect(documentSpaceService.isDocumentSpacesStatePromised).toEqual(true);

    jest.runOnlyPendingTimers();
    await cancellableRequest.promise;

    expect(documentSpaceService.isDocumentSpacesStatePromised).toEqual(false);

    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should get error status of Document Spaces States', async () => {
    const isDocumentSpacesStatePromisedSpy = jest.spyOn(
      documentSpaceService,
      'isDocumentSpacesStatePromised',
      'get'
    );

    // Test while state is promised
    isDocumentSpacesStatePromisedSpy.mockReturnValueOnce(true);

    expect(documentSpaceService.isDocumentSpacesStateErrored).toEqual(false);

    // Test when state is errored
    const errorPromise = Promise.reject('error');
    documentSpacesState.set(errorPromise);

    await expect(errorPromise).rejects.toBeDefined();
    expect(documentSpaceService.isDocumentSpacesStateErrored).toEqual(true);

    // Test when not promised and not errored
    documentSpacesState.set([]);

    expect(documentSpaceService.isDocumentSpacesStateErrored).toEqual(false);
  });

  it('should handle file upload', async () => {
    const mock = jest.spyOn(documentSpaceApi, 'upload').mockReturnValue(
      Promise.resolve(
        createAxiosSuccessResponse<{ [key: string]: string }>({ 'file': 'test' })
      )
    );

    await documentSpaceService.uploadFile('test', 'file contents', () => {}).promise;
    expect(mock).toHaveBeenCalled();
  });

  it('should handle file delete', async () => {
    const mock = jest.spyOn(documentSpaceApi, '_delete').mockReturnValue(
      Promise.resolve(
        createAxiosSuccessResponse<object>({ 'file': 'test' })
      )
    );

    await documentSpaceService.deleteFile('test', 'file');
    expect(mock).toHaveBeenCalled();
  });

  it('should reset state', () => {
    const isDocumentSpacesStatePromisedSpy = jest.spyOn(
      documentSpaceService,
      'isDocumentSpacesStatePromised',
      'get'
    );

    // Try to reset state while it is promised
    documentSpacesState.set(documentSpaces);

    isDocumentSpacesStatePromisedSpy.mockReturnValueOnce(true);

    documentSpaceService.resetState();

    expect(documentSpacesState.value).toEqual(documentSpaces);

    // Try to reset state when it is not promised
    documentSpacesState.set(documentSpaces);
    documentSpaceService.resetState();

    expect(documentSpacesState.value).toEqual([]);
  });

  it('should allow creation of space', async () => {
    const mock = jest.spyOn(documentSpaceApi, 'createSpace').mockReturnValue(
      Promise.resolve(
        createAxiosSuccessResponse<DocumentSpaceInfoDto>({ name: 'test' })
      )
    );

    const response = await documentSpaceService.createDocumentSpace({
      name: 'test',
    });
    expect(mock).toHaveBeenCalled();
    expect(response.name).toEqual('test');
  });

  it('should create relative download url for a single file download', () => {
    const space = 'testspace';
    const fileKey = 'testfile.key';

    const url = documentSpaceService.createRelativeDownloadFileUrl(space, fileKey);

    expect(url.endsWith(`/document-space/file/${space}/${fileKey}`)).toBeTruthy();
  });
});
