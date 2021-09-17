import { State } from '@hookstate/core';
import { AxiosPromise } from 'axios';
import { DocumentDto, DocumentSpaceControllerApiInterface, DocumentSpaceInfoDto } from '../../openapi';
import { CancellableDataRequest, isDataRequestCancelError, makeCancellableDataRequestToken } from '../../utils/cancellable-data-request';
import { prepareDataCrudErrorResponse } from '../data-service/data-service-utils';

export default class DocumentSpaceService {

  constructor(
    public documentFilesState: State<DocumentDto[]>,
    public documentSpacesState: State<DocumentSpaceInfoDto[]>,
    public documentSpaceApi: DocumentSpaceControllerApiInterface) {
  }

  fetchAndStoreDocuments(spaceName: string): CancellableDataRequest<DocumentDto[]> {
    if (spaceName == null || spaceName.trim().length === 0) {
      throw new Error("Document Space name must be defined");
    }

    const cancellableRequest = makeCancellableDataRequestToken(this.documentSpaceApi.listObjects.bind(this.documentSpaceApi, spaceName));

    const requestPromise = cancellableRequest.axiosPromise()
      .then(response => {
        return response.data.data;
      })
      .catch(error => {
        if (isDataRequestCancelError(error)) {
          return [];
        }

        return Promise.reject(prepareDataCrudErrorResponse(error));
      });


    this.documentFilesState.set(requestPromise);

    return {
      promise: requestPromise,
      cancelTokenSource: cancellableRequest.cancelTokenSource
    };
  }

  fetchAndStoreSpaces(): CancellableDataRequest<DocumentSpaceInfoDto[]> {
    const cancellableRequest = makeCancellableDataRequestToken(this.documentSpaceApi.getSpaces.bind(this.documentSpaceApi));

    const requestPromise = cancellableRequest.axiosPromise()
      .then(response => {
        return response.data.data;
      })
      .catch(error => {
        if (isDataRequestCancelError(error)) {
          return [];
        }

        return Promise.reject(prepareDataCrudErrorResponse(error));
      });


    this.documentSpacesState.set(requestPromise);

    return {
      promise: requestPromise,
      cancelTokenSource: cancellableRequest.cancelTokenSource
    };
  }

  resetState() {
    if (!this.documentFilesState.promised) {
      this.documentFilesState.set([]);
    }

    if (!this.documentSpacesState.promised) {
      this.documentSpacesState.set([]);
    }
  }
}
