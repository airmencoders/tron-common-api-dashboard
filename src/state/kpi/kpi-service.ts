import { State } from '@hookstate/core';
import { KpiControllerApiInterface, KpiSummaryDto } from '../../openapi';
import { CancellableDataRequest, makeCancellableDataRequestToken } from '../../utils/cancellable-data-request';
import { prepareRequestError } from '../../utils/ErrorHandling/error-handling-utils';

export default class KpiService {
  constructor(public state: State<KpiSummaryDto | KpiSummaryDto[] | undefined>,
    private kpiControllerApi: KpiControllerApiInterface
  ) { }

  fetchAndStoreData(startDate: string, endDate: string): CancellableDataRequest<KpiSummaryDto | undefined> {
    if (isNaN(Date.parse(startDate)) || isNaN(Date.parse(endDate))) {
      throw new Error("Could not parse date");
    }

    const kpiRequest = makeCancellableDataRequestToken(this.kpiControllerApi.getKpiSummary.bind(this.kpiControllerApi, startDate, endDate));

    const handledPromise = kpiRequest.axiosPromise()
      .then(response => response.data)
      .catch(error => {
        return Promise.reject(prepareRequestError(error));
      });

    this.state.set(handledPromise);

    return {
      promise: handledPromise,
      cancelTokenSource: kpiRequest.cancelTokenSource
    };
  }

  fetchAndStoreSeriesData(startDate: string, endDate: string): CancellableDataRequest<KpiSummaryDto[] | undefined> {
    if (isNaN(Date.parse(startDate)) || isNaN(Date.parse(endDate))) {
      throw new Error("Could not parse date");
    }

    const kpiRequest = makeCancellableDataRequestToken(this.kpiControllerApi.getKpiSeries.bind(this.kpiControllerApi, startDate, endDate));

    const handledPromise = kpiRequest.axiosPromise()
      .then(response => response.data.data)
      .catch(error => {
        return Promise.reject(prepareRequestError(error));
      });

    this.state.set(handledPromise);

    return {
      promise: handledPromise,
      cancelTokenSource: kpiRequest.cancelTokenSource
    };
  }

  get isPromised(): boolean {
    return this.state.promised;
  }

  get error(): any | undefined {
    return this.state.promised || !this.state.error ? undefined : this.state.error;
  }

  resetState() {
    if (!this.state.promised) {
      this.state.set(undefined);
    }
  }
}
