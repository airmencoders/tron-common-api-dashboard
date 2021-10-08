import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { render } from '@testing-library/react';
import { ApexOptions } from 'apexcharts';
import { MemoryRouter } from 'react-router-dom';
import { KpiControllerApi, KpiControllerApiInterface, KpiSummaryDto, UniqueVisitorCountDtoVisitorTypeEnum } from '../../../openapi';
import KpiService from '../../../state/kpi/kpi-service';
import { useKpiState } from '../../../state/kpi/kpi-state';
import KpiSeriesContentWithLoading from '../KpiSeriesContentWithLoading';

jest.mock('../../../state/kpi/kpi-state');
jest.mock('react-apexcharts', () => {
  return {
    __esModule: true,
    default: (props: {
      options: ApexOptions;
      series: { name: string; data: number[] }[];
      type: string;
      height: string;
      width: string
    }) => {
      return null;
    },
  }
});
describe('Test Kpi Series Content', () => {
  let kpiState: State<KpiSummaryDto | KpiSummaryDto[] | undefined> & StateMethodsDestroy;
  let kpiApi: KpiControllerApiInterface;

  beforeEach(() => {
    kpiState = createState<KpiSummaryDto | KpiSummaryDto[] | undefined>(undefined);
    kpiApi = new KpiControllerApi();

    mockKpiState();
  });

  function mockKpiState() {
    (useKpiState as jest.Mock).mockReturnValue(new KpiService(kpiState, kpiApi));
  }

  it('Test Renders correctly', () => {
    kpiState.set([
      {
        startDate: '2021-07-19',
        endDate: '2021-07-25',
        averageLatencyForSuccessfulRequests: 28,
        appSourceCount: 6,
        appClientToAppSourceRequestCount: 10,
        uniqueVisitorCounts: [
          {
            visitorType: UniqueVisitorCountDtoVisitorTypeEnum.AppClient,
            uniqueCount: 0,
            requestCount: 0
          },
          {
            visitorType: UniqueVisitorCountDtoVisitorTypeEnum.DashboardUser,
            uniqueCount: 0,
            requestCount: 0
          }
        ],
        serviceMetrics: []
      },
      {
        startDate: '2021-07-26',
        endDate: '2021-08-01',
        averageLatencyForSuccessfulRequests: 28,
        appSourceCount: 6,
        appClientToAppSourceRequestCount: 10,
        uniqueVisitorCounts: [
          {
            visitorType: UniqueVisitorCountDtoVisitorTypeEnum.AppClient,
            uniqueCount: 0,
            requestCount: 0
          },
          {
            visitorType: UniqueVisitorCountDtoVisitorTypeEnum.DashboardUser,
            uniqueCount: 0,
            requestCount: 0
          }
        ],
        serviceMetrics: []
      },
    ]);

    const page = render(
      <MemoryRouter>
        <KpiSeriesContentWithLoading isLoading={false} />
      </MemoryRouter>
    );

    expect(page.getByText(/Total Requests/i)).toBeInTheDocument();
  });

  it('Should render nothing if state is not set', async () => {
    kpiState.set(undefined);

    const page = render(
      <MemoryRouter>
        <KpiSeriesContentWithLoading isLoading={false} />
      </MemoryRouter>
    );

    await expect(page.findByText(/KPI Series Data/i)).rejects.toBeTruthy();
  });
})
