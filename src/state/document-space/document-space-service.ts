import { Downgraded, postpone, State } from '@hookstate/core';
import { IDatasource, IGetRowsParams } from 'ag-grid-community';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { InfiniteScrollOptions } from '../../components/DataCrudFormPage/infinite-scroll-options';
import { generateInfiniteScrollLimit } from '../../components/Grid/GridUtils/grid-utils';
import { ToastType } from '../../components/Toast/ToastUtils/toast-type';
import { createFailedDataFetchToast, createTextToast } from '../../components/Toast/ToastUtils/ToastUtils';
import {
  DocumentDto,
  DocumentMobileDto,
  DocumentSpaceControllerApiInterface, DocumentSpacePathItemsDto,
  DocumentSpaceRenameFileDto,
  DocumentSpaceRenameFolderDto,
  DocumentSpaceRequestDto,
  DocumentSpaceResponseDto, DocumentSpaceUserCollectionResponseDto,
  FilePathSpec,
  RecentDocumentDto,
  S3PaginationDto
} from '../../openapi';
import { DocumentSpaceFolderInfoDto } from '../../openapi/models/document-space-folder-info-dto';
import { CancellableDataRequest, isDataRequestCancelError, makeCancellableDataRequestToken } from '../../utils/cancellable-data-request';
import { applySortCriteria } from '../../utils/document-space-utils';
import { prepareRequestError } from '../../utils/ErrorHandling/error-handling-utils';
import { accessDocumentSpacePrivilegesState } from './document-space-state';

export enum ArchivedStatus {
  ARCHIVED,
  NOT_ARCHIVED
}

export default class DocumentSpaceService {
  constructor(
    public documentSpaceApi: DocumentSpaceControllerApiInterface,
    public documentSpacesState: State<DocumentSpaceResponseDto[]>
  ) {}

  private paginationPageToTokenMap = new Map<number, string | undefined>([[0, undefined]]);

  private fetchSpacesRequest?: CancellableDataRequest<DocumentSpaceResponseDto[]> = undefined;

  createDatasource(spaceName: string, path: string, infiniteScrollOptions: InfiniteScrollOptions, status: ArchivedStatus = ArchivedStatus.NOT_ARCHIVED): IDatasource {
    return {
      getRows: async (params: IGetRowsParams) => {
        try {
          const limit = generateInfiniteScrollLimit(infiniteScrollOptions);
          const page = Math.floor(params.startRow / limit);
          let data: S3PaginationDto;
          if (status === ArchivedStatus.NOT_ARCHIVED) {
            data = (await this.documentSpaceApi.dumpContentsAtPath(spaceName, path)).data;
          } else if (status === ArchivedStatus.ARCHIVED) {
            data = await this.getAllArchivedItemsForUser();
          } else {
            throw new Error('Illegal Archived Status value');
          }

          this.paginationPageToTokenMap.set(page + 1, data.nextContinuationToken);

          // until we get true paginated, infinite scroll, we sort here
          const dataItems: DocumentDto[] = applySortCriteria(data.documents, params.sortModel[0]);
  
          let lastRow = -1;

          /**
           * Last page, calculate the last row
           */
          if (data.nextContinuationToken == null) {
            lastRow = page * limit + dataItems.length;
          }

          params.successCallback(dataItems, lastRow);
        } catch (err) {
          params.failCallback();

          /**
           * Don't error out the state here. If the request fails for some reason, just show nothing.
           * 
           * Call the success callback as a hack to prevent
           * ag grid from showing an infinite loading state on failure.
           */
          params.successCallback([], 0);

          const requestErr = prepareRequestError(err);

          if (requestErr.status != null) {
            createFailedDataFetchToast();
            return;
          }

          /**
           * Something else went wrong... the request did not leave
           */
          createTextToast(ToastType.ERROR, requestErr.message, { autoClose: false });
          return;
        }
      },
    };
  }

   /**
   * Used to see if a file(s) exists on the backend
   * @param spaceId Space id
   * @param path path
   * @param files file name(s)
   * @returns array of fileNames that exist on backend (of the names given) or the Axios error (via exception) value if backend call failed
   */
  async checkIfFileExistsAtPath(spaceId: string, path: string, files: string[]): Promise<string[]> {
    try {
      const response = await this.documentSpaceApi.statElementsAtPath(spaceId, { currentPath: path, items: files });
      const resp: string[] = [];
      if (response.data) {
        for (const file of files) {
          // if this file was in the response, then it exists
          if (response.data.data.find((item) => item.itemName === file)) {
            resp.push(file);
          }
        }
      }
      return resp;
    } catch (error) {
      return Promise.reject(prepareRequestError(error).message);
    }
  }

  // helper to fetch the archived items for the archived items page
  //  and also to go ahead and populate the archived items user privs state for
  //  the current user
  async getAllArchivedItemsForUser(): Promise<S3PaginationDto> {
    const items = (await this.documentSpaceApi.getAllArchivedFilesForAuthUser()).data;
    const spaceIdsList = new Set<string>();
    for (const entry of items.documents) {
      if (!spaceIdsList.has(entry.spaceId)) {
        spaceIdsList.add(entry.spaceId);
      }
    }
    await accessDocumentSpacePrivilegesState().fetchAndStoreDashboardUserDocumentSpacesPrivileges(spaceIdsList).promise;
    return items;
  }

  createFavoritesDocumentsDatasource(documentSpaceId: string, infiniteScrollOptions: InfiniteScrollOptions): IDatasource {
    return {
      getRows: async (params: IGetRowsParams) => {
        try {
          const limit = generateInfiniteScrollLimit(infiniteScrollOptions);
          const page = Math.floor(params.startRow / limit);
          const data: DocumentSpaceUserCollectionResponseDto[] = (
            await this.documentSpaceApi.getFavorites(documentSpaceId)
          ).data.data;

          let lastRow = -1;

          /**
           * Last page, calculate the last row
           */
          if (data.length === 0 || data.length < limit) {
            lastRow = page * limit + data.length;
          }

          params.successCallback(data, lastRow);
        } catch (err) {
          params.failCallback();

          /**
           * Don't error out the state here. If the request fails for some reason, just show nothing.
           *
           * Call the success callback as a hack to prevent
           * ag grid from showing an infinite loading state on failure.
           */
          params.successCallback([], 0);

          const requestErr = prepareRequestError(err);

          if (requestErr.status != null) {
            createFailedDataFetchToast();
            return;
          }

          /**
           * Something else went wrong... the request did not leave
           */
          createTextToast(ToastType.ERROR, requestErr.message, { autoClose: false });
          return;
        }
      },
    };
  }

  createRecentUploadsForSpaceDatasource(documentSpaceId: string, infiniteScrollOptions: InfiniteScrollOptions): IDatasource {
    return {
      getRows: async (params: IGetRowsParams) => {
        try {
          const limit = generateInfiniteScrollLimit(infiniteScrollOptions);
          const page = Math.floor(params.startRow / limit);
          const data: RecentDocumentDto[] = (await this.documentSpaceApi.getRecentsForSpace(documentSpaceId, undefined, page, limit)).data.data;

          let lastRow = -1;

          /**
           * Last page, calculate the last row
           */
          if (data.length === 0 || data.length < limit) {
            lastRow = (page * limit) + data.length;
          }

          params.successCallback(data, lastRow);
        } catch (err) {
          params.failCallback();

          /**
           * Don't error out the state here. If the request fails for some reason, just show nothing.
           *
           * Call the success callback as a hack to prevent
           * ag grid from showing an infinite loading state on failure.
           */
          params.successCallback([], 0);

          const requestErr = prepareRequestError(err);

          if (requestErr.status != null) {
            createFailedDataFetchToast();
            return;
          }

          /**
           * Something else went wrong... the request did not leave
           */
          createTextToast(ToastType.ERROR, requestErr.message, { autoClose: false });
          return;
        }
      }
    }
  }

  /**
   * Creates the ag-grid datasource for the document space search page
   * @param documentSpaceId the document space id
   * @param infiniteScrollOptions scrolling settings
   * @param searchString the search query    
   * @returns datasource
   */
  createSearchDatasource(documentSpaceId: string, infiniteScrollOptions: InfiniteScrollOptions, searchString: string|undefined): IDatasource {
    return {
      getRows: async (params: IGetRowsParams) => {
        try {
          const limit = generateInfiniteScrollLimit(infiniteScrollOptions);
          const page = Math.floor(params.startRow / limit);
          let data: DocumentMobileDto[];
          if (!!searchString) {
            data = (await this.documentSpaceApi.searchDocumentSpace(documentSpaceId, { query: searchString }, page, limit)).data.data;
          } else {
            data = [];
          }
          
          let lastRow = -1;

          /**
           * Last page, calculate the last row
           */
          if (data.length === 0 || data.length < limit) {
            lastRow = page * limit + data.length;
          }

          params.successCallback(data, lastRow);
        } catch (err) {
          params.failCallback();

          /**
           * Don't error out the state here. If the request fails for some reason, just show nothing.
           *
           * Call the success callback as a hack to prevent
           * ag grid from showing an infinite loading state on failure.
           */
          params.successCallback([], 0);

          const requestErr = prepareRequestError(err);

          if (requestErr.status != null) {
            createFailedDataFetchToast();
            return;
          }

          /**
           * Something else went wrong... the request did not leave
           */
          createTextToast(ToastType.ERROR, requestErr.message, { autoClose: false });
          return;
        }
      },
    };
  }

  fetchAndStoreSpaces(): CancellableDataRequest<DocumentSpaceResponseDto[]> {
    // Only allow a single request to fetch spaces
    if (this.fetchSpacesRequest != null) {
      this.fetchSpacesRequest.cancelTokenSource.cancel();
    }

    const cancellableRequest = makeCancellableDataRequestToken(
      this.documentSpaceApi.getSpaces.bind(this.documentSpaceApi)
    );

    const spacesRequest = cancellableRequest
      .axiosPromise()
      .then((response) => {
        return response.data.data;
      })
      .catch((error) => {
        if (isDataRequestCancelError(error)) {
          return [];
        }

        return Promise.reject(prepareRequestError(error).message);
      });

    const dataRequest = {
      promise: spacesRequest,
      cancelTokenSource: cancellableRequest.cancelTokenSource,
    };

    this.fetchSpacesRequest = dataRequest;

    this.documentSpacesState.batch((state) => {
      if (state.promised) {
        return postpone;
      }

      state.set(spacesRequest);
    });

    return dataRequest;
  }

  async createNewFolder(space: string, path: string, name: string): Promise<void> {
    try {
      await this.documentSpaceApi.createFolder(space, { path: path, folderName: name });
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(prepareRequestError(error).message);
    }
  }

  async createDocumentSpace(dto: DocumentSpaceRequestDto): Promise<DocumentSpaceResponseDto> {
    try {
      const spaceDto = await this.documentSpaceApi.createSpace(dto);
      this.documentSpacesState[this.documentSpacesState.length].set(spaceDto.data);
      return Promise.resolve(spaceDto.data);
    } catch (error) {
      return Promise.reject(prepareRequestError(error).message);
    }
  }

  async deleteFileBySpaceAndParent(documentSpaceId: string, parentFolderId: string, filename: string) {
    try {
      return await this.documentSpaceApi.deleteFileBySpaceAndParent(documentSpaceId, parentFolderId, filename);
    } catch (error) {
      return Promise.reject(prepareRequestError(error).message);
    }
  }

  async deleteDocumentSpace(documentSpaceId: string): Promise<void> {
    try {
      await this.documentSpaceApi.deleteSpace(documentSpaceId);
      return Promise.resolve();
    }
    catch (error) {
      return Promise.reject((error as AxiosError).response?.data?.reason ?? (error as AxiosError).message);
    }
  }

  async deleteArchiveItemBySpaceAndParent(documentSpaceId: string, parentFolderId: string, name: string) {
    try {
      return await this.documentSpaceApi.deleteArchiveItemBySpaceAndParent(documentSpaceId, parentFolderId, name);
    } catch (error) {
      return Promise.reject(prepareRequestError(error).message);
    }
  }

  async deleteItems(space: string, path: string, items: string[]): Promise<void> {
    try {
      await this.documentSpaceApi.deleteItems(space, { currentPath: path, items: [...items] });
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(prepareRequestError(error).message);
    }
  }

  async renameFile(space: string, filePath: string, existingFilename: string, newName: string): Promise<void> {
    try {
      await this.documentSpaceApi.renameFile(space, {
        filePath,
        existingFilename,
        newName,
      } as DocumentSpaceRenameFileDto);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(prepareRequestError(error).message);
    }
  }

  async renameFolder(space: string, pathPlusFolder: string, name: string): Promise<void> {
    try {
      await this.documentSpaceApi.renameFolder(space, {
        existingFolderPath: pathPlusFolder,
        newName: name,
      } as DocumentSpaceRenameFolderDto);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(prepareRequestError(error).message);
    }
  }

  async archiveItems(space: string, path: string, items: string[]): Promise<void> {
    try {
      await this.documentSpaceApi.archiveItems(space, { currentPath: path, itemsToArchive: [...items] });
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(prepareRequestError(error).message);
    }
  }

  async unArchiveItems(space: string, items: string[]): Promise<void> {
    try {
      await this.documentSpaceApi.unArchiveItems(space, { itemsToUnArchive: [...items] });
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(prepareRequestError(error).message);
    }
  }

  uploadFile(
    space: string,
    path: string,
    file: any,
    progressCallback: (percent: number) => void
  ): CancellableDataRequest<AxiosResponse<{ [key: string]: string }>> {
    const token = axios.CancelToken.source();
    const promise = this.documentSpaceApi.upload(space, path, file, {
      headers: { 'Last-Modified': (file as File).lastModified },  // send the last modified date with the file
      cancelToken: token.token,
      onUploadProgress: function (progressEvent: any) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        progressCallback(percentCompleted);
      },
    });

    return {
      promise: promise as Promise<AxiosResponse<{ [key: string]: string }>>,
      cancelTokenSource: token,
    };
  }
  get isDocumentSpacesStatePromised(): boolean {
    return this.documentSpacesState.promised;
  }

  get isDocumentSpacesStateErrored(): boolean {
    if (this.isDocumentSpacesStatePromised) {
      return false;
    }

    if (this.documentSpacesState.error != null) {
      return true;
    }

    return false;
  }

  get documentSpaces(): DocumentSpaceResponseDto[] {
    if (this.isDocumentSpacesStatePromised || this.isDocumentSpacesStateErrored) {
      return [];
    }

    return this.documentSpacesState.attach(Downgraded).value;
  }

  resetState(): void {
    if (!this.isDocumentSpacesStatePromised) {
      this.documentSpacesState.set([]);
    }

    // Cancel pending requests if necessary
    this.fetchSpacesRequest?.cancelTokenSource.cancel();
    this.fetchSpacesRequest = undefined;

    this.resetPaginationMap();
  }

  resetPaginationMap(): void {
    this.paginationPageToTokenMap = new Map([[0, undefined]]);
  }

  async patchDefaultDocumentSpace(spaceId: string): Promise<string> {
    try {
      await this.documentSpaceApi.patchSelfDocumentSpaceDefault(spaceId);
      return Promise.resolve(spaceId);
    } catch (error) {
      return Promise.reject(prepareRequestError(error).message);
    }
  }

  async getDocumentSpaceEntryPath(spaceId: string, entryId: string): Promise<string> {
    try {
      const stringAxiosResponse = await this.documentSpaceApi.getDocumentSpaceEntryPath(spaceId, entryId);
      return Promise.resolve(stringAxiosResponse.data);
    } catch (error) {
      return Promise.reject(prepareRequestError(error).message);
    }
  }

  async addEntityToFavorites(documentSpaceId: string, entityId: string): Promise<FilePathSpec> {
    try {
      return (await this.documentSpaceApi.addEntityToFavorites(documentSpaceId, entityId)).data;
    }
    catch (error) {
      return Promise.reject(prepareRequestError(error).message);
    }
  }

  async addPathEntityToFavorites(documentSpaceId: string, documentSpacePathItemsDto: DocumentSpacePathItemsDto): Promise<void> {
    try {
      await this.documentSpaceApi.addPathEntityToFavorites(documentSpaceId, documentSpacePathItemsDto);
      return Promise.resolve();
    }
    catch (error) {
      return Promise.reject(prepareRequestError(error).message);
    }
  }

  async removePathEntityFromFavorites(documentSpaceId: string, documentSpacePathItemsDto: DocumentSpacePathItemsDto): Promise<void> {
    try {
      await this.documentSpaceApi.removePathEntityFromFavorites(documentSpaceId, documentSpacePathItemsDto);
      return Promise.resolve();
    }
    catch (error) {
      return Promise.reject(prepareRequestError(error).message);
    } 
  }

  async removeEntityFromFavorites(documentSpaceId: string, entityId: string): Promise<FilePathSpec> {
    try {
      return (await this.documentSpaceApi.removeEntityFromFavorites(documentSpaceId, entityId)).data;
    }
    catch (error) {
      return Promise.reject(prepareRequestError(error).message);
    }
  }

  async getFavorites(documentSpaceId: string): Promise<DocumentSpaceUserCollectionResponseDto[]> {
    try {
      return (await this.documentSpaceApi.getFavorites(documentSpaceId)).data.data;
    }
    catch (error) {
      return Promise.reject(prepareRequestError(error).message);
    }
  }

  async getFolderSize(documentSpaceId: string, folderPath: string): Promise<DocumentSpaceFolderInfoDto> {
    try {
      return (await this.documentSpaceApi.getFolderSize(documentSpaceId, folderPath)).data;
    } 
    catch (error) {
      return Promise.reject(prepareRequestError(error).message);
    }
  }

  async copyFiles(destinationSpaceId: string, sourceSpaceId: string | undefined, items: { [key: string]: string }): Promise<void> {
    try {    
      await this.documentSpaceApi.copyFiles(destinationSpaceId, items, sourceSpaceId);
      return Promise.resolve();
    }
    catch (error) {
      return Promise.reject(prepareRequestError(error).message);
    }
  }

  async moveFiles(destinationSpaceId: string, sourceSpaceId: string | undefined, items: { [key: string]: string }): Promise<void> {
    try {
      await this.documentSpaceApi.moveFiles(destinationSpaceId, items, sourceSpaceId);
      return Promise.resolve();
    }
    catch (error) {
      return Promise.reject(prepareRequestError(error).message);
    }
  }
}
