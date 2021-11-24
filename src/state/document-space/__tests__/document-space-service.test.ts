import {createState, State} from '@hookstate/core';
import {AxiosResponse} from 'axios';
import {InfiniteScrollOptions} from '../../../components/DataCrudFormPage/infinite-scroll-options';
import {generateInfiniteScrollLimit} from '../../../components/Grid/GridUtils/grid-utils';
import {
  DocumentDto,
  DocumentSpaceControllerApi,
  DocumentSpaceControllerApiInterface,
  DocumentSpacePathItemsDto,
  DocumentSpaceRenameFolderDto,
  DocumentSpaceResponseDto,
  DocumentSpaceResponseDtoResponseWrapper,
  DocumentSpaceUserCollectionResponseDto,
  DocumentSpaceUserCollectionResponseDtoWrapper,
  FilePathSpec,
  FilePathSpecWrapper,
  GenericStringArrayResponseWrapper,
  S3PaginationDto
} from '../../../openapi';
import * as cancellableDataRequestImp from '../../../utils/cancellable-data-request';
import {prepareRequestError} from '../../../utils/ErrorHandling/error-handling-utils';
import {RequestError} from '../../../utils/ErrorHandling/request-error';
import {
  createAxiosNoContentResponse,
  createAxiosSuccessResponse,
  createGenericAxiosRequestErrorResponse
} from '../../../utils/TestUtils/test-utils';
import DocumentSpaceService, {ArchivedStatus} from '../document-space-service';

describe('Test Document Space Service', () => {
  const infiniteScrollOptions: InfiniteScrollOptions = {
    enabled: true,
    limit: 5,
  };

  const spaceName = 'somespace';

  const documents: DocumentDto[] = [
    {
      spaceId: '90f4d33b-b761-4a29-bcdd-1bf8fe46831c',
      key: 'file.txt',
      path: spaceName,
      size: 1000,
      lastModifiedBy: '',
      lastModifiedDate: '2021-09-17T14:09:10.154Z',
    },
    {
      spaceId: '407bf847-5ac7-485c-842f-c9efaf8a6b5d',
      key: 'file2.txt',
      path: spaceName,
      size: 20000,
      lastModifiedBy: '',
      lastModifiedDate: '2021-09-17T15:09:10.154Z',
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

  const documentSpaces: DocumentSpaceResponseDto[] = [
    {
      id: '412ea028-1fc5-41e0-b48a-c6ef090704d3',
      name: 'space1',
    },
    {
      id: '52909027-69f6-4d0c-83da-293bc2d9d2f8',
      name: 'space2',
    }
  ];

  const getSpacesResponse: AxiosResponse<DocumentSpaceResponseDtoResponseWrapper> = createAxiosSuccessResponse(
    {
      data: documentSpaces,
    }
  );

  let documentSpacesState: State<DocumentSpaceResponseDto[]>;
  let documentSpaceApi: DocumentSpaceControllerApiInterface;
  let documentSpaceService: DocumentSpaceService;

  beforeEach(() => {
    documentSpacesState = createState<DocumentSpaceResponseDto[]>([]);
    documentSpaceApi = new DocumentSpaceControllerApi();
    documentSpaceService = new DocumentSpaceService(
      documentSpaceApi,
      documentSpacesState
    );
  });

  it('should create datasource and fetch documents', (done) => {
    documentSpaceApi.dumpContentsAtPath = jest.fn(() => {
      return Promise.resolve(listObjectsResponse);
    });

    const apiRequestSpy = jest.spyOn(documentSpaceApi, 'dumpContentsAtPath');

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
      "",
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

  it('should create datasource for archived items', (done) => {
    documentSpaceApi.getAllArchivedFilesForAuthUser = jest.fn(() => {
      return Promise.resolve(listObjectsResponse);
    });

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
      "",
      infiniteScrollOptions,
      ArchivedStatus.ARCHIVED
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
  });

  it('should create datasource and fail on server error response', (done) => {
    const badRequestError = createGenericAxiosRequestErrorResponse(500);

    documentSpaceApi.dumpContentsAtPath = jest.fn(() => {
      return Promise.reject(badRequestError);
    });

    const apiRequestSpy = jest.spyOn(documentSpaceApi, 'dumpContentsAtPath');
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
      "",
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
    documentSpaceApi.dumpContentsAtPath = jest.fn(() => {
      return Promise.reject(new Error('Catch all exception'));
    });

    const apiRequestSpy = jest.spyOn(documentSpaceApi, 'dumpContentsAtPath');

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
      "",
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

    await documentSpaceService.uploadFile('test', "", 'file contents', () => {}).promise;
    expect(mock).toHaveBeenCalled();
  });

  it('should handle file delete', async () => {
    const mock = jest.spyOn(documentSpaceApi, 'deleteItems').mockReturnValue(
      Promise.resolve(
        createAxiosSuccessResponse<GenericStringArrayResponseWrapper>({ data: [], pagination: {} } as GenericStringArrayResponseWrapper)
      )
    );

    await documentSpaceService.deleteItems('test', "", ['file']);
    expect(mock).toHaveBeenCalled();
  });

  it('should allow folder creation', async () => {
    const mock = jest.spyOn(documentSpaceApi, 'createFolder').mockReturnValue(
      Promise.resolve(
        createAxiosSuccessResponse<FilePathSpec>({ documentSpaceId: '', itemId: '', itemName: ''} as FilePathSpec)
      )
    );

    await documentSpaceService.createNewFolder('test', "", 'folder');
    expect(mock).toHaveBeenCalled();
  });

  it('should allow folder rename', async () => {
    const mock = jest
      .spyOn(documentSpaceApi, 'renameFolder')
      .mockReturnValue(
        Promise.resolve(
          createAxiosSuccessResponse<DocumentSpaceRenameFolderDto>({ newName: 'blah', existingFolderPath: '/' })
        )
      );

    await documentSpaceService.renameFolder('test', '/some', 'folder');
    expect(mock).toHaveBeenCalled();
  });

  it('should allow file rename', async () => {
    const mock = jest
      .spyOn(documentSpaceApi, 'renameFile')
      .mockReturnValue(
        Promise.resolve(
          createAxiosNoContentResponse()
        )
      );

    await documentSpaceService.renameFile('space', 'space', 'file1', 'file2');
    expect(mock).toHaveBeenCalled();
  });

  it('should allow archiving', async () => {
    const mock = jest.spyOn(documentSpaceApi, 'archiveItems').mockReturnValue(
      Promise.resolve(createAxiosNoContentResponse()));

    await documentSpaceService.archiveItems('test', '/', ['folder']);
    expect(mock).toHaveBeenCalled();
  });

  it('should allow unarchiving', async () => {
    const mock = jest.spyOn(documentSpaceApi, 'unArchiveItems').mockReturnValue(
      Promise.resolve(createAxiosNoContentResponse()));

    await documentSpaceService.unArchiveItems('test', ['folder']);
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
        createAxiosSuccessResponse<DocumentSpaceResponseDto>({ id: '52909027-69f6-4d0c-83da-293bc2d9d2f8', name: 'test' })
      )
    );

    const response = await documentSpaceService.createDocumentSpace({
      name: 'test',
    });
    expect(mock).toHaveBeenCalled();
    expect(response.name).toEqual('test');
  });


  it('should create relative download url for multi file download', () => {
    const documentSpaceId = '412ea028-1fc5-41e0-b48a-c6ef090704d3';

    const url = documentSpaceService.createRelativeFilesDownloadUrl(documentSpaceId, '/', documents);

    expect(url.endsWith(`/document-space/spaces/${documentSpaceId}/files/download?path=/&files=${documents.map(document => document.key).join(',')}`)).toBeTruthy();
  });

  it('should create relative download url for a single file download', () => {
    const documentSpaceId = '412ea028-1fc5-41e0-b48a-c6ef090704d3';
    const fileKey = 'testfile.key';

    const url = documentSpaceService.createRelativeDownloadFileUrl(documentSpaceId, '/', fileKey);

    expect(url.endsWith(`/document-space/space/${documentSpaceId}/${fileKey}`)).toBeTruthy();
  });

  it('should create relative download url to download entire space', () => {
    const documentSpaceId = '412ea028-1fc5-41e0-b48a-c6ef090704d3';

    const url = documentSpaceService.createRelativeDownloadAllFilesUrl(documentSpaceId);

    expect(url.endsWith(`/document-space/spaces/${documentSpaceId}/files/download/all`)).toBeTruthy();
  });

  it('should create relative download url by Document Space and Parent', () => {
    const documentSpaceId = '412ea028-1fc5-41e0-b48a-c6ef090704d3';
    const parentFolderId = '00000000-0000-0000-0000-000000000000';
    const filename = 'testfile.txt';

    // Test for preview link
    let url = documentSpaceService.createRelativeDownloadFileUrlBySpaceAndParent(documentSpaceId, parentFolderId, filename);
    expect(url.endsWith(`/document-space/spaces/${documentSpaceId}/folder/${parentFolderId}/file/${filename}`)).toBeTruthy();

    // Test for direct download link
    url = documentSpaceService.createRelativeDownloadFileUrlBySpaceAndParent(documentSpaceId, parentFolderId, filename, true);
    expect(url.endsWith(`/document-space/spaces/${documentSpaceId}/folder/${parentFolderId}/file/${filename}?download=true`)).toBeTruthy();
  });

  it('should allow file deletion by Document Space and Parent', async () => {
    const mock = jest.spyOn(documentSpaceApi, 'deleteFileBySpaceAndParent').mockReturnValue(
      Promise.resolve(
        createAxiosSuccessResponse<void>(void (0))
      )
    );

    const documentSpaceId = '412ea028-1fc5-41e0-b48a-c6ef090704d3';
    const parentFolderId = '00000000-0000-0000-0000-000000000000';
    const filename = 'testfile.txt';

    await documentSpaceService.deleteFileBySpaceAndParent(documentSpaceId, parentFolderId, filename);
    expect(mock).toHaveBeenCalled();
  });

  it('should allow file archive deletion by Document Space and Parent', async () => {
    const mock = jest.spyOn(documentSpaceApi, 'deleteArchiveItemBySpaceAndParent').mockReturnValue(
      Promise.resolve(
        createAxiosSuccessResponse<void>(void (0))
      )
    );

    const documentSpaceId = '412ea028-1fc5-41e0-b48a-c6ef090704d3';
    const parentFolderId = '00000000-0000-0000-0000-000000000000';
    const filename = 'testfile.txt';

    await documentSpaceService.deleteArchiveItemBySpaceAndParent(documentSpaceId, parentFolderId, filename);
    expect(mock).toHaveBeenCalled();
  });

  it('should get a prepared error when deleting file by Document Space and Parent', async () => {
    const axiosError = createGenericAxiosRequestErrorResponse(400);
    const mock = jest.spyOn(documentSpaceApi, 'deleteFileBySpaceAndParent').mockRejectedValue(axiosError);

    const documentSpaceId = '412ea028-1fc5-41e0-b48a-c6ef090704d3';
    const parentFolderId = '00000000-0000-0000-0000-000000000000';
    const filename = 'testfile.txt';
    const expectedError = prepareRequestError(axiosError);

    await expect(documentSpaceService.deleteFileBySpaceAndParent(documentSpaceId, parentFolderId, filename)).rejects.toEqual(expectedError);
    expect(mock).toHaveBeenCalled();
  });

  it('should create favorites datasource', (done) => {
    const favoritesList: DocumentSpaceUserCollectionResponseDto[] = [{id: 'id', itemId: 'itemId', documentSpaceId: 'docSpaceId', key: 'key', parentId: 'parentId', lastModifiedDate:'', metadata: {}, folder: true,}]
    const favoritesResponse: AxiosResponse<DocumentSpaceUserCollectionResponseDtoWrapper> = createAxiosSuccessResponse(
      {
        data: favoritesList,
      }
    );
    documentSpaceApi.getFavorites = jest.fn(() => {
      return Promise.resolve(favoritesResponse);
    });

    const apiRequestSpy = jest.spyOn(documentSpaceApi, 'getFavorites');

    const onSuccess = jest.fn((data) => {
      try {
        expect(data).toEqual(
          expect.arrayContaining(favoritesResponse.data.data)
        );
        done();
      } catch (err) {
        done(err);
      }
    });
    const onFail = jest.fn();
    const datasource = documentSpaceService.createFavoritesDocumentsDatasource(
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


  it('should allow a patch default document space to be made', async () => {
    const mock = jest.spyOn(documentSpaceApi, 'patchSelfDocumentSpaceDefault').mockReturnValue(Promise.resolve(createAxiosSuccessResponse<void>(void (0))));

    await documentSpaceService.patchDefaultDocumentSpace('spaceId');
    expect(mock).toHaveBeenCalled();
  });

  it('should make call to get path', async () => {
    const mock = jest.spyOn(documentSpaceApi, 'getDocumentSpaceEntryPath').mockReturnValue(Promise.resolve(createAxiosSuccessResponse<string>('path/to/doc')));

    const path = await documentSpaceService.getDocumentSpaceEntryPath('spaceId', 'entryId');
    expect(mock).toHaveBeenCalled();
    expect(path).toEqual('path/to/doc')
  });

  it('should successfully post an entity to favorites ', async () => {
    const returnFileSpecPath = {
      fullPathSpec: 'path/to/doc',
      documentSpaceId: 'id',
      itemId: 'itemId',
      itemName: 'key',
    }

    const mock = jest.spyOn(documentSpaceApi, 'addEntityToFavorites').mockReturnValue(Promise.resolve(createAxiosSuccessResponse<FilePathSpec>(returnFileSpecPath)));

    const path = await documentSpaceService.addEntityToFavorites('spaceId', 'entryId');
    expect(mock).toHaveBeenCalled();
    expect(path.data).toEqual(returnFileSpecPath)
  });

  it('should successfully delete an entity from favorites ', async () => {
    const returnFileSpecPath = {
      fullPathSpec: 'path/to/doc',
      documentSpaceId: 'id',
      itemId: 'itemId',
      itemName: 'key',
    }

    const mock = jest.spyOn(documentSpaceApi, 'removeEntityFromFavorites').mockReturnValue(Promise.resolve(createAxiosSuccessResponse<FilePathSpec>(returnFileSpecPath)));

    const path = await documentSpaceService.removeEntityFromFavorites('spaceId', 'entryId');
    expect(mock).toHaveBeenCalled();
    expect(path.data).toEqual(returnFileSpecPath)
  });
  it('should successfully post a path entity to favorites ', async () => {
    const docSpaceDto: DocumentSpacePathItemsDto = {
      currentPath: '',
      items: ['key1']
    }
    const mock = jest.spyOn(documentSpaceApi, 'addPathEntityToFavorites').mockReturnValue(
      Promise.resolve(
        createAxiosSuccessResponse<void>(void (0))
      )
    );
    await documentSpaceService.addPathEntityToFavorites('spaceId', docSpaceDto);
    expect(mock).toHaveBeenCalled();
  });

  it('should successfully delete a path entity from favorites ', async () => {

    const docSpaceDto: DocumentSpacePathItemsDto = {
      currentPath: '',
      items: ['key1']
    }
    const mock = jest.spyOn(documentSpaceApi, 'removePathEntityFromFavorites').mockReturnValue(
      Promise.resolve(
        createAxiosSuccessResponse<void>(void (0))
      )
    );

    await documentSpaceService.removePathEntityFromFavorites('spaceId', docSpaceDto);
    expect(mock).toHaveBeenCalled();
  });

  it('should return list of files that exist on backend', async () => {
    const mock = jest
      .spyOn(documentSpaceApi, 'statElementsAtPath')
      .mockReturnValue(
        Promise.resolve(
          createAxiosSuccessResponse<FilePathSpecWrapper>({
            data: [{ itemName: 'some-file', documentSpaceId: '1', itemId: '1' }, { itemName: 'some-other-file', documentSpaceId: '1', itemId: '2' }],
          })
        )
      );

    const response = await documentSpaceService.checkIfFileExistsAtPath('1', '/', [ 'some-file' ]);
    expect(response).toContain('some-file');
  });

});
