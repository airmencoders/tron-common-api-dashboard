import { State } from '@hookstate/core';
import { IDatasource, IGetRowsParams } from 'ag-grid-community';
import { InfiniteScrollOptions } from '../../components/DataCrudFormPage/infinite-scroll-options';
import { generateInfiniteScrollLimit } from '../../components/Grid/GridUtils/grid-utils';
import { ToastType } from '../../components/Toast/ToastUtils/toast-type';
import { createFailedDataFetchToast, createTextToast } from '../../components/Toast/ToastUtils/ToastUtils';
import { DocumentDto, DocumentSpaceControllerApiInterface, DocumentSpaceInfoDto, S3PaginationDto } from '../../openapi';
import { CancellableDataRequest, isDataRequestCancelError, makeCancellableDataRequestToken } from '../../utils/cancellable-data-request';
import { prepareRequestError } from '../../utils/ErrorHandling/error-handling-utils';

export default class DocumentSpaceService {
  constructor(
    public documentSpaceApi: DocumentSpaceControllerApiInterface,
    public documentSpacesState: State<DocumentSpaceInfoDto[]>) { }

  private paginationPageToTokenMap = new Map<number, string | undefined>([[0, undefined]]);

  createDatasource(spaceName: string, infiniteScrollOptions: InfiniteScrollOptions): IDatasource {
    const datasource: IDatasource = {
      getRows: async (params: IGetRowsParams) => {
        try {
          const limit = generateInfiniteScrollLimit(infiniteScrollOptions);
          const page = Math.floor(params.startRow / limit);
          const continuationToken = this.paginationPageToTokenMap.get(page);

          const data: S3PaginationDto = (await this.documentSpaceApi.listObjects(spaceName, continuationToken, limit)).data;

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

  fetchAndStoreSpaces(): CancellableDataRequest<DocumentSpaceInfoDto[]> {
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

  get documentSpaces(): DocumentSpaceInfoDto[] {
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
}
