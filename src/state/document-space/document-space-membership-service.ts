import { IDatasource, IGetRowsParams } from 'ag-grid-community';
import { InfiniteScrollOptions } from '../../components/DataCrudFormPage/infinite-scroll-options';
import { convertAgGridSortToQueryParams, generateInfiniteScrollLimit } from '../../components/Grid/GridUtils/grid-utils';
import { ToastType } from '../../components/Toast/ToastUtils/toast-type';
import { createFailedDataFetchToast, createTextToast } from '../../components/Toast/ToastUtils/ToastUtils';
import { DocumentSpaceControllerApiInterface, DocumentSpaceDashboardMemberRequestDto, DocumentSpaceDashboardMemberResponseDto } from '../../openapi';
import { prepareRequestError } from '../../utils/ErrorHandling/error-handling-utils';

export default class DocumentSpaceMembershipService {
  constructor(
    public documentSpaceApi: DocumentSpaceControllerApiInterface) { }

  createMembersDatasource(spaceId: string, infiniteScrollOptions: InfiniteScrollOptions): IDatasource {
    const datasource: IDatasource = {
      getRows: async (params: IGetRowsParams) => {
        try {
          const limit = generateInfiniteScrollLimit(infiniteScrollOptions);
          const page = Math.floor(params.startRow / limit);

          const sort = convertAgGridSortToQueryParams(params.sortModel);

          const data: DocumentSpaceDashboardMemberResponseDto[] = (await this.documentSpaceApi.getDashboardUsersForDocumentSpace(spaceId, page, limit, sort)).data.data;

          let lastRow = -1;

          /**
           * If the request returns data with length of 0, then
           * there is no more data to be retrieved.
           *
           * If the request returns data with length less than the limit,
           * then that is the last page.
           */
          if (data.length == 0 || data.length < limit)
            lastRow = (page * limit) + data.length;

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

          /**
           * Server responded with some other response
           */
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

  async addDocumentSpaceMember(documentSpaceId: string, dashboardMemberDto: DocumentSpaceDashboardMemberRequestDto) {
    return this.documentSpaceApi.addUserToDocumentSpace(documentSpaceId, dashboardMemberDto);
  }
}
