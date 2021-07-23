import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { KpiControllerApi, KpiControllerApiInterface, KpiSummaryDto } from '../../../openapi';
import KpiService from '../../../state/kpi/kpi-service';
import { useKpiState } from '../../../state/kpi/kpi-state';
import { formatDateToEnCa } from '../../../utils/date-utils';
import KpiContentWithLoading from '../KpiContentWithLoading';

jest.mock('../../../state/kpi/kpi-state');
describe('Test Kpi Contet', () => {
  let kpiState: State<KpiSummaryDto> & StateMethodsDestroy;
  let kpiApi: KpiControllerApiInterface;

  beforeEach(() => {
    kpiState = createState<KpiSummaryDto>({});
    kpiApi = new KpiControllerApi();

    mockKpiState();
  });

  function mockKpiState() {
    (useKpiState as jest.Mock).mockReturnValue(new KpiService(kpiState, kpiApi));
  }

  it('Test Renders correctly', () => {
    kpiState.set({
      averageLatencyForSuccessfulRequests: 28,
      appSourceCount: 6,
      appClientToAppSourceRequestCount: 10,
      uniqueVisitorySummary: {
        dashboardUserCount: 6,
        dashboardUserRequestCount: 48108,
        appClientCount: 4,
        appClientRequestCount: 476
      }
    });

    const startDate = new Date('2021-07-11');
    const endDate = new Date('2021-07-12');

    const page = render(
      <MemoryRouter>
        <KpiContentWithLoading isLoading={false} startDate={formatDateToEnCa(startDate)} endDate={formatDateToEnCa(endDate)} />
      </MemoryRouter>
    );

    expect(page.getByText(/Showing KPIs for 2021-07-11 to 2021-07-12/i)).toBeInTheDocument();
  });

  it('Test Renders correctly with defaults', () => {
    kpiState.set({
      averageLatencyForSuccessfulRequests: undefined,
      appSourceCount: undefined,
      appClientToAppSourceRequestCount: undefined,
      uniqueVisitorySummary: {
        dashboardUserCount: undefined,
        dashboardUserRequestCount: undefined,
        appClientCount: undefined,
        appClientRequestCount: undefined
      }
    });

    const startDate = new Date('2021-07-11');
    const endDate = new Date('2021-07-12');

    const page = render(
      <MemoryRouter>
        <KpiContentWithLoading isLoading={false} startDate={formatDateToEnCa(startDate)} endDate={formatDateToEnCa(endDate)} />
      </MemoryRouter>
    );

    expect(page.getByText(/Showing KPIs for 2021-07-11 to 2021-07-12/i)).toBeInTheDocument();
  });
})
