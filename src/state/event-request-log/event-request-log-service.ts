import { IDatasource, IGetRowsParams } from 'ag-grid-community';
import { InfiniteScrollOptions } from '../../components/DataCrudFormPage/infinite-scroll-options';
import { GridFilter } from '../../components/Grid/grid-filter';
import { convertAgGridSortToQueryParams, generateInfiniteScrollLimit } from '../../components/Grid/GridUtils/grid-utils';
import { ToastType } from '../../components/Toast/ToastUtils/toast-type';
import { createFailedDataFetchToast, createTextToast } from '../../components/Toast/ToastUtils/ToastUtils';
import { EventRequestLogControllerApiInterface, EventRequestLogDto, EventRequestLogDtoPaginationResponseWrapper } from '../../openapi';
import { prepareRequestError } from '../../utils/ErrorHandling/error-handling-utils';
import { AgGridFilterConversionError } from '../../utils/Exception/AgGridFilterConversionError';
import { EventRequestLogDtoFlat } from './event-request-log-dto-flat';

export default class EventRequestLogService {
  constructor(private eventRequestLogApi: EventRequestLogControllerApiInterface) { }

  createDatasource(appClientId: string, infiniteScrollOptions?: InfiniteScrollOptions): IDatasource {
    const datasource: IDatasource = {
      getRows: async (params: IGetRowsParams) => {
        const limit = generateInfiniteScrollLimit(infiniteScrollOptions);
        const page = Math.floor(params.startRow / limit);

        const filter = new GridFilter(params.filterModel);
        const sort = convertAgGridSortToQueryParams(params.sortModel);

        try {
          let data: EventRequestLogDtoPaginationResponseWrapper;

          const filterDto = filter.getFilterDto();
          if (filterDto != null) {
            data = (await this.eventRequestLogApi.getEventRequestLogsByAppClientIdWithFilter(appClientId, filterDto, page, limit, sort)).data;
          } else {
            data = (await this.eventRequestLogApi.getEventRequestLogsByAppClientId(appClientId, page, limit, sort)).data;
          }

          const dataItems: EventRequestLogDtoFlat[] = this.convertDtosToFlat(data.data);

          let lastRow = -1;

          /**
           * Last page, calculate the last row
           */
          if (dataItems.length == 0 || dataItems.length < limit)
            lastRow = (page * limit) + dataItems.length;

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

          if (err instanceof AgGridFilterConversionError) {
            createTextToast(ToastType.ERROR, err.message, { autoClose: false });
            return;
          }

          const requestErr = prepareRequestError(err);

          /**
           * A 400 status with a filter model set means that the server
           * sent back a validation error.
           */
          if (requestErr.status === 400 && params.filterModel != null) {
            createTextToast(ToastType.ERROR, `Failed to filter with error: ${requestErr.message}`, { autoClose: false });
            return;
          }

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

  convertDtoToFlat(dto: EventRequestLogDto): EventRequestLogDtoFlat {
    return {
      eventType: dto.eventType,
      eventCount: dto.eventCount,
      wasSuccessful: dto.wasSuccessful,
      reason: dto.reason,
      lastAttempted: dto.lastAttempted
    };
  }

  convertDtosToFlat(dtos: EventRequestLogDto[]): EventRequestLogDtoFlat[] {
    return dtos.map(dto => this.convertDtoToFlat(dto));
  }
}
