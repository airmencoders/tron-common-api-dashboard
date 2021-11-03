import { State } from '@hookstate/core';
import { IDatasource, IGetRowsParams } from 'ag-grid-community';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { Set } from 'typescript';
import Config from '../../api/config';
import { InfiniteScrollOptions } from '../../components/DataCrudFormPage/infinite-scroll-options';
import { generateInfiniteScrollLimit } from '../../components/Grid/GridUtils/grid-utils';
import { ToastType } from '../../components/Toast/ToastUtils/toast-type';
import { createFailedDataFetchToast, createTextToast } from '../../components/Toast/ToastUtils/ToastUtils';
import { DocumentDto, DocumentSpaceControllerApiInterface, DocumentSpacePrivilegeDto, DocumentSpacePrivilegeDtoTypeEnum, DocumentSpaceRequestDto, DocumentSpaceResponseDto, RecentDocumentDto, S3PaginationDto } from '../../openapi';
import { CancellableDataRequest, isDataRequestCancelError, makeCancellableDataRequestToken, CancellableAxiosDataRequest } from '../../utils/cancellable-data-request';
import { prepareRequestError } from '../../utils/ErrorHandling/error-handling-utils';

export default class DocumentSpaceService {
  constructor(
    public documentSpaceApi: DocumentSpaceControllerApiInterface,
    public documentSpacesState: State<DocumentSpaceResponseDto[]>) { }

  private paginationPageToTokenMap = new Map<number, string | undefined>([[0, undefined]]);

  createDatasource(spaceName: string, path: string, infiniteScrollOptions: InfiniteScrollOptions): IDatasource {
    const datasource: IDatasource = {
      getRows: async (params: IGetRowsParams) => {
        try {
          const limit = generateInfiniteScrollLimit(infiniteScrollOptions);
          const page = Math.floor(params.startRow / limit);
          const data: S3PaginationDto = (await this.documentSpaceApi.dumpContentsAtPath(spaceName, path)).data;

          this.paginationPageToTokenMap.set(page + 1, data.nextContinuationToken);

          const dataItems: DocumentDto[] = data.documents;

          let lastRow = -1;

          /**
           * Last page, calculate the last row
           */
          if (data.nextContinuationToken == null) {
            lastRow = (page * limit) + dataItems.length;
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
      }
    }

    return datasource;
  }

  createRecentDocumentsDatasource(infiniteScrollOptions: InfiniteScrollOptions): IDatasource {
    const datasource: IDatasource = {
      getRows: async (params: IGetRowsParams) => {
        try {
          const limit = generateInfiniteScrollLimit(infiniteScrollOptions);
          const page = Math.floor(params.startRow / limit);
          const data: RecentDocumentDto[] = (await this.documentSpaceApi.getRecentlyUploadedFilesByAuthenticatedUser(page, limit)).data.data;

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

    return datasource;
  }

  fetchAndStoreSpaces(): CancellableDataRequest<DocumentSpaceResponseDto[]> {
    const cancellableRequest = makeCancellableDataRequestToken(this.documentSpaceApi.getSpaces.bind(this.documentSpaceApi));

    const spacesRequest = cancellableRequest.axiosPromise()
      .then(response => {
        return response.data.data;
      })
      .catch(error => {
        if (isDataRequestCancelError(error)) {
          return [];
        }

        return Promise.reject(prepareRequestError(error));
      });

    this.documentSpacesState.set(spacesRequest);

    return {
      promise: spacesRequest,
      cancelTokenSource: cancellableRequest.cancelTokenSource
    };
  }

  async createNewFolder(space: string, path: string, name: string): Promise<void> {
    try {
      await this.documentSpaceApi.createFolder(space, { path: path, folderName: name });
      return Promise.resolve();
    }
    catch (e) {
      return Promise.reject((e as AxiosError).response?.data?.reason ?? (e as AxiosError).message);
    }
  }

  async createDocumentSpace(dto: DocumentSpaceRequestDto): Promise<DocumentSpaceResponseDto> {
    try {
      const spaceDto = await this.documentSpaceApi.createSpace(dto);
      this.documentSpacesState[this.documentSpacesState.length].set(spaceDto.data);
      return Promise.resolve(spaceDto.data);
    }
    catch (e) {
      return Promise.reject((e as AxiosError).response?.data?.reason ?? (e as AxiosError).message);
    }
  }

  async getDashboardUserPrivilegesForDocumentSpace(documentSpaceId: string) {
    const privileges = (await this.documentSpaceApi.getSelfDashboardUserPrivilegesForDocumentSpace(documentSpaceId)).data.data;
    return this.convertDocumentSpacePrivilegesToRecord(privileges);
  }

  async getDashboardUserPrivilegesForDocumentSpaces(documentSpaceIds: Set<string>): Promise<Record<string, Record<DocumentSpacePrivilegeDtoTypeEnum, boolean>>> {
    // Contains requests made to get privileges for each document space
    const requests: Promise<{ id: string, privileges: Record<DocumentSpacePrivilegeDtoTypeEnum, boolean> }>[] = [];

    // Maps the index of a request to the document space id
    const requestToDocumentSpaceIdMap: Map<number, string> = new Map();

    documentSpaceIds.forEach(id => {
      requests.push(
        this.documentSpaceApi.getSelfDashboardUserPrivilegesForDocumentSpace(id)
          .then(response => {
            return {
              id,
              privileges: this.convertDocumentSpacePrivilegesToRecord(response.data.data)
            }
          })
      );
      requestToDocumentSpaceIdMap.set(requests.length - 1, id);
    });

    const data = await Promise.allSettled(requests);
    const privileges: Record<string, Record<DocumentSpacePrivilegeDtoTypeEnum, boolean>> = {};

    data.forEach((privilegePromise, idx) => {
      const id = requestToDocumentSpaceIdMap.get(idx);
      if (id != null && privilegePromise.status === 'fulfilled') {
        privileges[privilegePromise.value.id] = privilegePromise.value.privileges;
      }
    });

    return privileges;
  }

  convertDocumentSpacePrivilegesToRecord(privileges: DocumentSpacePrivilegeDto[]): Record<DocumentSpacePrivilegeDtoTypeEnum, boolean> {
    return Object.values(DocumentSpacePrivilegeDtoTypeEnum).reduce<Record<DocumentSpacePrivilegeDtoTypeEnum, boolean>>((prev, curr) => {
      prev[curr] = privileges?.find(privilege => privilege.type === curr) ? true : false;
      return prev;
    }, { READ: false, WRITE: false, MEMBERSHIP: false });
  }

  createRelativeFilesDownloadUrl(id: string, path: string, documents: DocumentDto[]) {
    const fileKeysParam = documents.map(document => document.key).join(',');
    return `${Config.API_URL_V2}` + (`document-space/spaces/${id}/files/download?path=${path}&files=${fileKeysParam}`).replace(/[\/]+/g, '/');
  }

  createRelativeDownloadFileUrl(id: string, path: string, key: string): string {
    return `${Config.API_URL_V2}` + (`document-space/space/${id}/${path}/${key}`.replace(/[\/]+/g, '/'));  // remove any repeated '/'s
  }

  createRelativeDownloadAllFilesUrl(id: string): string {
    return `${Config.API_URL_V2}document-space/spaces/${id}/files/download/all`;
  }

  createRelativeDownloadFileUrlBySpaceAndParent(documentSpaceId: string, parentFolderId: string, filename: string): string {
    return `${Config.API_URL_V2}` + (`document-space/spaces/${documentSpaceId}/folder/${parentFolderId}/file/${filename}`.replace(/[\/]+/g, '/'));  // remove any repeated '/'s
  }

  // deleteFileBySpaceAndParent(documentSpaceId: string, parentFolderId: string, filename: string): CancellableDataRequest<void> {
  //   const cancellableRequest = makeCancellableDataRequestToken(this.documentSpaceApi.deleteFileBySpaceAndParent.bind(this.documentSpaceApi, documentSpaceId, parentFolderId, filename));
  //   const deleteRequest = cancellableRequest.axiosPromise()
  //     .then(response => response.data)
  //     .catch(error => {
  //       if (isDataRequestCancelError(error)) {
  //         return;
  //       }

  //       return Promise.reject(prepareRequestError(error));
  //     });

  //   return {
  //     promise: deleteRequest,
  //     cancelTokenSource: cancellableRequest.cancelTokenSource
  //   };
  // }

  async deleteFileBySpaceAndParent(documentSpaceId: string, parentFolderId: string, filename: string) {
    try {
      return await this.documentSpaceApi.deleteFileBySpaceAndParent(documentSpaceId, parentFolderId, filename);
    } catch (error) {
      return prepareRequestError(error);
    }
  }

  async deleteIems(space: string, path: string, items: string[]): Promise<void> {
    try {
    await this.documentSpaceApi.deleteItems(space, { currentPath: path, itemsToDelete: [...items] });
    return Promise.resolve();
  }
  catch (e) {
    return Promise.reject((e as AxiosError).response?.data?.reason ?? (e as AxiosError).message);
  }
  }

  uploadFile(space: string, path: string, file: any, progressCallback: (percent: number) => void): CancellableDataRequest<AxiosResponse<{ [key: string]: string}>> {
    const token = axios.CancelToken.source();
    const promise = this.documentSpaceApi.upload(space, path, file, { cancelToken: token.token, onUploadProgress: function(progressEvent: any) {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      progressCallback(percentCompleted);
    }});

    return {
      promise: promise as Promise<AxiosResponse<{ [key: string]: string }>>,
      cancelTokenSource: token
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

    return this.documentSpacesState.value;
  }

  resetState(): void {
    if (!this.isDocumentSpacesStatePromised) {
      this.documentSpacesState.set([]);
    }

    this.resetPaginationMap();
  }

  resetPaginationMap(): void {
    this.paginationPageToTokenMap = new Map([[0, undefined]]);
  }


  async patchDefaultDocumentSpace(spaceId: string): Promise<string> {
    try {
      await this.documentSpaceApi.patchSelfDocumentSpaceDefault(spaceId);
      return Promise.resolve(spaceId);
    }
    catch (e) {
      return Promise.reject((e as AxiosError).response?.data?.reason ?? (e as AxiosError).message);
    }
  }
}
