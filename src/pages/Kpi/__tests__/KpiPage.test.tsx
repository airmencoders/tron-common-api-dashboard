import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { fireEvent, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { KpiControllerApi, KpiControllerApiInterface, KpiSummaryDto, UniqueVisitorCountDtoVisitorTypeEnum } from '../../../openapi';
import KpiService from '../../../state/kpi/kpi-service';
import { useKpiState } from '../../../state/kpi/kpi-state';
import { formatDateToEnCa } from '../../../utils/date-utils';
import { createAxiosSuccessResponse } from '../../../utils/TestUtils/test-utils';
import KpiPage from '../KpiPage';

jest.mock('../../../state/kpi/kpi-state');
describe('Test Kpi Page', () => {
  let kpiState: State<KpiSummaryDto | undefined> & StateMethodsDestroy;
  let kpiApi: KpiControllerApiInterface;

  beforeEach(() => {
    kpiState = createState<KpiSummaryDto | undefined>(undefined);
    kpiApi = new KpiControllerApi();

    mockKpiState();
  });

  function mockKpiState() {
    (useKpiState as jest.Mock).mockReturnValue(new KpiService(kpiState, kpiApi));
  }

  it('Test Loading Page', async () => {
    jest.spyOn(useKpiState(), 'isPromised', 'get').mockReturnValue(true);

    const page = render(
      <MemoryRouter>
        <KpiPage />
      </MemoryRouter>
    );

    expect(page.getByText('Loading...')).toBeDefined();
  });

  it('Test Date validation', () => {
    jest.spyOn(useKpiState(), 'isPromised', 'get').mockReturnValue(false);
    jest.spyOn(useKpiState(), 'error', 'get').mockReturnValue(undefined);

    const page = render(
      <MemoryRouter>
        <KpiPage />
      </MemoryRouter>
    );

    const startDateElem = page.getByLabelText('From (UTC)');
    const endDateElem = page.getByLabelText('To (UTC)');
    expect(startDateElem).toBeInTheDocument();
    expect(endDateElem).toBeInTheDocument();

    let date = new Date();
    date.setDate(date.getUTCDate() + 1);
    const dateInFutureString = formatDateToEnCa(date);
    fireEvent.change(startDateElem, { target: { value: dateInFutureString } });
    expect(page.getByText(/Start Date cannot be in the future/i)).toBeInTheDocument();

    date = new Date();
    let endDate = new Date(date);
    date.setDate(date.getDate() - 5);
    endDate.setDate(endDate.getDate() - 10);
    fireEvent.change(startDateElem, { target: { value: formatDateToEnCa(date) } });
    fireEvent.change(endDateElem, { target: { value: formatDateToEnCa(endDate) } });
    expect(page.getByText(/Start Date must be equal to or before End Date/i)).toBeInTheDocument();
  });

  it('Fetch data button click handler', () => {
    const apiCall = jest.spyOn(kpiApi, 'getKpiSummary').mockImplementation(() => {

      return Promise.resolve(
        createAxiosSuccessResponse({
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
          ]
        })
      );
    });

    const page = render(
      <MemoryRouter>
        <KpiPage />
      </MemoryRouter>
    );

    fireEvent.click(page.getByText(/Get KPIs/i));

    expect(apiCall).toHaveBeenCalledTimes(1);

  });
})
