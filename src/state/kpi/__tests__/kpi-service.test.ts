import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { KpiControllerApi, KpiControllerApiInterface, KpiSummaryDto, UniqueVisitorCountDtoVisitorTypeEnum } from '../../../openapi';
import { formatDateToEnCa } from '../../../utils/date-utils';
import RequestError from '../../../utils/ErrorHandling/request-error';
import { createAxiosSuccessResponse } from '../../../utils/TestUtils/test-utils';
import KpiService from '../kpi-service';

describe('KPI Service Tests', () => {
  let kpiState: State<KpiSummaryDto | KpiSummaryDto[] | undefined> & StateMethodsDestroy;
  let kpiApi: KpiControllerApiInterface;
  let kpiService: KpiService;

  let testKpiSummary: KpiSummaryDto;

  beforeEach(async () => {
    kpiState = createState<KpiSummaryDto | KpiSummaryDto[] | undefined>(undefined);
    kpiApi = new KpiControllerApi();
    kpiService = new KpiService(kpiState, kpiApi);

    testKpiSummary = {
      startDate: formatDateToEnCa(new Date(2021, 6, 19)),
      endDate: formatDateToEnCa(new Date(2021, 6, 25)),
      averageLatencyForSuccessfulRequests: 28,
      appSourceCount: 6,
      appClientToAppSourceRequestCount: 10,
      uniqueVisitorCounts: [
        {
          visitorType: UniqueVisitorCountDtoVisitorTypeEnum.AppClient,
          uniqueCount: 6,
          requestCount: 48108
        },
        {
          visitorType: UniqueVisitorCountDtoVisitorTypeEnum.DashboardUser,
          uniqueCount: 4,
          requestCount: 476
        }
      ],
      serviceMetrics: []
    };
  });

  afterEach(() => {
    kpiState.destroy();
  });

  it('should fetch and store Summary data', async () => {
    kpiApi.getKpiSummary = jest.fn(() => {
      return Promise.resolve(createAxiosSuccessResponse(testKpiSummary));
    });

    const startDate = new Date();
    const endDate = new Date(startDate.getDate() + 2);

    const cancellableRequest = kpiService.fetchAndStoreData(formatDateToEnCa(startDate), formatDateToEnCa(endDate));
    await cancellableRequest.promise;

    expect(kpiService.state.value).toEqual(testKpiSummary);
  });

  it('should reject on fetch and store Summary data if error', async () => {
    kpiApi.getKpiSummary = jest.fn(() => {
      return Promise.reject(Error('rejected'));
    });

    const startDate = new Date();
    const endDate = new Date(startDate.getDate() + 2);

    const cancellableRequest = kpiService.fetchAndStoreData(formatDateToEnCa(startDate), formatDateToEnCa(endDate));

    await expect(cancellableRequest.promise).rejects.toEqual(new RequestError({message: 'rejected'}));
  });

  it('should throw on bad date when fetch and store Summary data', () => {
    expect(() => kpiService.fetchAndStoreData("bad date", "bad date")).toThrow('Could not parse date');
  });

  it('should fetch and store Series data', async () => {
    kpiApi.getKpiSeries = jest.fn(() => {
      return Promise.resolve(createAxiosSuccessResponse({ data: [testKpiSummary] }));
    });

    const startDate = new Date();
    const endDate = new Date(startDate.getDate() + 2);

    const cancellableRequest = kpiService.fetchAndStoreSeriesData(formatDateToEnCa(startDate), formatDateToEnCa(endDate));
    await cancellableRequest.promise;

    expect(kpiService.state.value).toEqual([testKpiSummary]);
  });

  it('should reject on fetch and store Series data if error', async () => {
    kpiApi.getKpiSeries = jest.fn(() => {
      return Promise.reject(Error('rejected'));
    });

    const startDate = new Date();
    const endDate = new Date(startDate.getDate() + 2);

    const cancellableRequest = kpiService.fetchAndStoreSeriesData(formatDateToEnCa(startDate), formatDateToEnCa(endDate));

    await expect(cancellableRequest.promise).rejects.toEqual(new RequestError({message: 'rejected'}));
  });

  it('should throw on bad date when fetch and store Series data', () => {
    expect(() => kpiService.fetchAndStoreSeriesData("bad date", "bad date")).toThrow('Could not parse date');
  });

  it('should return error if state is in error state', async () => {
    kpiApi.getKpiSummary = jest.fn(() => {
      return Promise.reject(Error('rejected'));
    });

    const startDate = new Date();
    const endDate = new Date(startDate.getDate() + 2);

    const cancellableRequest = kpiService.fetchAndStoreData(formatDateToEnCa(startDate), formatDateToEnCa(endDate));
    await expect(cancellableRequest.promise).rejects.toBeTruthy();

    expect(kpiService.error).toEqual(new RequestError({message: 'rejected'}));
  });

  it('should not reset state if promised state', async () => {
    jest.useFakeTimers();

    kpiApi.getKpiSummary = jest.fn(() => {
      return new Promise(resolve => setTimeout(async () => {
        resolve(createAxiosSuccessResponse(testKpiSummary));
      }, 1000));
    });

    const startDate = new Date();
    const endDate = new Date(startDate.getDate() + 2);
    const cancellableRequest = kpiService.fetchAndStoreData(formatDateToEnCa(startDate), formatDateToEnCa(endDate));

    kpiService.resetState();
    expect(kpiService.isPromised).toBeTruthy();

    jest.runOnlyPendingTimers();
    await cancellableRequest.promise;

    expect(kpiService.state.value).toBeTruthy();

    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });
});
