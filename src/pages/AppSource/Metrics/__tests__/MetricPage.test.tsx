import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AppSourceCountMetricDto, MetricsControllerApi, MetricsControllerApiInterface } from '../../../../openapi';
import AppSourceMetricService from '../../../../state/metrics/app-source-metric-service';
import { useAppSourceMetricState } from '../../../../state/metrics/app-source-metric-state';
import { MetricPage } from '../MetricPage';

jest.mock('../../../../state/metrics/app-source-metric-state');
jest.mock('react-apexcharts', () => {
  return {
    __esModule: true,
    default: () => {
      return <div>MockChart</div>
    },
  }
})

describe('Test Metric Page', () => {
  let metricState: State<AppSourceCountMetricDto> & StateMethodsDestroy;
  let appSourceApi: MetricsControllerApiInterface;
  let selectedSourceState: State<{appSourceId: string; name: string; type: string}> & StateMethodsDestroy;

  beforeEach(() => {
    metricState = createState<AppSourceCountMetricDto>({
        id: '1',
        name: 'source1',
        endpoints: [],
        appClients: []
    });
    appSourceApi = new MetricsControllerApi();
    selectedSourceState = createState({appSourceId: '1234', name: '', type: 'appsource'});
  });

  it('should render the page', async () => {
    const changeFunc = (value: any) => null;

    function mockAppSourceMetricState() {
      (useAppSourceMetricState as jest.Mock).mockReturnValue(new AppSourceMetricService(metricState, appSourceApi));

      jest.spyOn(useAppSourceMetricState(), 'isPromised', 'get').mockReturnValue(false);
    }

    mockAppSourceMetricState();
    const page = render(
      <MemoryRouter>
        <MetricPage
          id="1"
          name="name"
          titleChange={changeFunc}
          linkChange={changeFunc} />
      </MemoryRouter>
    );

    await waitFor(() => page.getAllByText('MockChart'));

    expect(page.getAllByText('MockChart').length).toEqual(2);
  });

  it('should render the page', async () => {
    const changeFunc = (value: any) => null;

    function mockAppSourceMetricState() {
      (useAppSourceMetricState as jest.Mock).mockReturnValue(new AppSourceMetricService(metricState, appSourceApi));

      jest.spyOn(useAppSourceMetricState(), 'isPromised', 'get').mockReturnValue(false);
    }

    mockAppSourceMetricState();
    const metricPage = <MetricPage
        id="1"
        name="name"
        titleChange={changeFunc}
        linkChange={changeFunc} />;

    const page = render(
      <MemoryRouter>
        {metricPage}
      </MemoryRouter>
    );

    await waitFor(() => page.getAllByText('MockChart'));

    expect(page.getAllByText('MockChart').length).toEqual(2);
  });
})
