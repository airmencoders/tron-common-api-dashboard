import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import {fireEvent, render, waitFor} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { KpiControllerApi, KpiControllerApiInterface, KpiSummaryDto, UniqueVisitorCountDtoVisitorTypeEnum } from '../../../openapi';
import KpiService from '../../../state/kpi/kpi-service';
import { useKpiState } from '../../../state/kpi/kpi-state';
import { formatDateToEnCa } from '../../../utils/date-utils';
import { createAxiosSuccessResponse } from '../../../utils/TestUtils/test-utils';
import KpiPage from '../KpiPage';

jest.mock('../../../state/kpi/kpi-state');
describe('Test Kpi Page', () => {
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

  it('Test Loading Page', async () => {
    jest.useFakeTimers();

    const apiCall = jest.spyOn(kpiApi, 'getKpiSummary').mockImplementation(() => {
      return new Promise(resolve => setTimeout(() => resolve(
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
          ],
          serviceMetrics: []
        })), 1000)
      );
    });

    const page = render(
      <MemoryRouter>
        <KpiPage />
      </MemoryRouter>
    );

    fireEvent.click(page.getByText(/Get KPI Summary/i));
    expect(page.getByText('Loading...')).toBeDefined();

    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('Test Summary Date validation', () => {
    jest.spyOn(useKpiState(), 'isPromised', 'get').mockReturnValue(false);
    jest.spyOn(useKpiState(), 'error', 'get').mockReturnValue(undefined);

    const page = render(
      <MemoryRouter>
        <KpiPage />
      </MemoryRouter>
    );

    const startDateElem = page.getByLabelText('Summary From (UTC)');
    const endDateElem = page.getByLabelText('Summary To (UTC)');
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

  it('Test Series Date validation', () => {
    jest.spyOn(useKpiState(), 'isPromised', 'get').mockReturnValue(false);
    jest.spyOn(useKpiState(), 'error', 'get').mockReturnValue(undefined);

    const page = render(
      <MemoryRouter>
        <KpiPage />
      </MemoryRouter>
    );

    const startDateElem = page.getByLabelText('Series From (UTC)');
    const endDateElem = page.getByLabelText('Series To (UTC)');
    expect(startDateElem).toBeInTheDocument();
    expect(endDateElem).toBeInTheDocument();

    let date = new Date();
    date.setDate(date.getUTCDate() + 1);
    const dateInFutureString = formatDateToEnCa(date);
    fireEvent.change(startDateElem, { target: { value: dateInFutureString } });
    expect(page.getByText(/Start Date cannot be in the future/i)).toBeInTheDocument();

    date = new Date();
    let endDate = new Date(date);
    date.setDate(date.getDate() + 1);
    endDate.setDate(endDate.getDate() + 2);
    fireEvent.change(startDateElem, { target: { value: formatDateToEnCa(date) } });
    fireEvent.change(endDateElem, { target: { value: formatDateToEnCa(endDate) } });
    expect(page.getByText(/Start Date cannot be in the future or within the current week/i)).toBeInTheDocument();
  });

  it('Fetch Summary data button click handler', () => {
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
          ],
          serviceMetrics: []
        })
      );
    });

    const page = render(
      <MemoryRouter>
        <KpiPage />
      </MemoryRouter>
    );

    fireEvent.click(page.getByText(/Get KPI Summary/i));

    expect(apiCall).toHaveBeenCalledTimes(1);
  });

  it('Fetch Series data button click handler', () => {
    const apiCall = jest.spyOn(kpiApi, 'getKpiSeries').mockImplementation(() => {
      return Promise.resolve(
        createAxiosSuccessResponse({
          data: [
            {
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

    fireEvent.click(page.getByText(/Get KPI Series/i));

    expect(apiCall).toHaveBeenCalledTimes(1);
  });
})
