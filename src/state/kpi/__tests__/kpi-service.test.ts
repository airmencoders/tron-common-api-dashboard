import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { KpiControllerApi, KpiControllerApiInterface, KpiSummaryDto } from '../../../openapi';
import { formatDateToEnCa } from '../../../utils/date-utils';
import { createAxiosSuccessResponse } from '../../../utils/TestUtils/test-utils';
import KpiService from '../kpi-service';

describe('App Client State Tests', () => {
  let kpiState: State<KpiSummaryDto> & StateMethodsDestroy;
  let kpiApi: KpiControllerApiInterface;
  let kpiService: KpiService;

  let testKpiSummary: KpiSummaryDto;

  beforeEach(async () => {
    kpiState = createState<KpiSummaryDto>({});
    kpiApi = new KpiControllerApi();
    kpiService = new KpiService(kpiState, kpiApi);

    testKpiSummary = {
      averageLatencyForSuccessfulRequests: 28,
      appSourceCount: 6,
      appClientToAppSourceRequestCount: 10,
      uniqueVisitorySummary: {
        dashboardUserCount: 6,
        dashboardUserRequestCount: 48108,
        appClientCount: 4,
        appClientRequestCount: 476
      }
    };
  });

  afterEach(() => {
    kpiState.destroy();
  });

  it('should fetch and store data', async () => {
    kpiApi.getKpiSummary = jest.fn(() => {
      return Promise.resolve(createAxiosSuccessResponse(testKpiSummary));
    });

    const startDate = new Date();
    const endDate = new Date(startDate.getDate() + 2);

    const cancellableRequest = kpiService.fetchAndStoreData(formatDateToEnCa(startDate), formatDateToEnCa(endDate));
    await cancellableRequest.promise;

    expect(kpiService.isSet).toEqual(true);
    expect(kpiService.state.value).toEqual(testKpiSummary);
  });

  it('fetch and store should throw on bad date', () => {
    expect(() => kpiService.fetchAndStoreData("bad date", "bad date")).toThrow('Could not parse date');
  });

  it('should have empty object as default', () => {
    expect(kpiService.state.value).toEqual({});

    expect(kpiService.isSet).toEqual(false);
  });
});
