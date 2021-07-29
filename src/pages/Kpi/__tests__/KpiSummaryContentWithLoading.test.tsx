import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { KpiControllerApi, KpiControllerApiInterface, KpiSummaryDto, UniqueVisitorCountDtoVisitorTypeEnum } from '../../../openapi';
import KpiService from '../../../state/kpi/kpi-service';
import { useKpiState } from '../../../state/kpi/kpi-state';
import KpiContentWithLoading from '../KpiSummaryContentWithLoading';

jest.mock('../../../state/kpi/kpi-state');
describe('Test Kpi Summary Content', () => {
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
    kpiState.set({
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
      ]
    });

    const page = render(
      <MemoryRouter>
        <KpiContentWithLoading isLoading={false} />
      </MemoryRouter>
    );

    expect(page.getByText(/Showing KPIs for 2021-07-19 to 2021-07-25/i)).toBeInTheDocument();
  });

  it('Test Renders correctly with defaults', () => {
    kpiState.set({
      startDate: '2021-07-19',
      endDate: '2021-07-25',
      appSourceCount: 0,
      appClientToAppSourceRequestCount: 0
    });

    const page = render(
      <MemoryRouter>
        <KpiContentWithLoading isLoading={false} />
      </MemoryRouter>
    );

    expect(page.getByText(/Showing KPIs for 2021-07-19 to 2021-07-25/i)).toBeInTheDocument();
  });

  it('Should render nothing if state is not set', async () => {
    kpiState.set(undefined);

    const page = render(
      <MemoryRouter>
        <KpiContentWithLoading isLoading={false} />
      </MemoryRouter>
    );

    await expect(page.findByText(/Showing KPIs for 2021-07-19 to 2021-07-25/i)).rejects.toBeTruthy();
  });
})
