import React from 'react';
import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { ApexOptions } from 'apexcharts';
import { MemoryRouter, Route } from 'react-router-dom';
import { AppSourceCountMetricDto, MetricsControllerApi, MetricsControllerApiInterface } from '../../../../openapi';
import AppSourceMetricService from '../../../../state/metrics/app-source-metric-service';
import { useAppSourceMetricState } from '../../../../state/metrics/app-source-metric-state';
import { MetricPage } from '../MetricPage';
import { MetricType } from '../metric-type';
import { RoutePath } from '../../../../routes';
import { generateMetricsLink } from '../metric-page-utils';
import { RequestMethod } from '../../../../state/metrics/metric-service';

jest.mock('../../../../state/metrics/app-source-metric-state');
jest.mock('../SimpleEndpointMetricChart', () => () => <div>SimpleEndpointMetricChart</div>);
jest.mock('../SimpleAppClientMetricChart', () => () => <div>SimpleAppClientMetricChart</div>);
jest.mock('react-apexcharts', () => {
  return {
    __esModule: true,
    default: (props: {
      options: ApexOptions; 
      series: {name: string; data: number[]}[];
      type: string;
      height: string;
      width: string
    }) => {
      return <div>{props.options.title?.text}
          <button onClick={() => {
            props.options.chart!.events!.dataPointSelection!(null, null, {w: {config: props.options}, dataPointIndex: 0 })
          }}>
            dataPointSelection - {props.options.title?.text}
          </button>
          <div>{props.options.title?.text} - data.length = {props.series[0].data.toString()}</div>
        </div>
    },
  }
});

describe('Test Metric Page', () => {
  let metricState: State<AppSourceCountMetricDto> & StateMethodsDestroy;
  let appSourceApi: MetricsControllerApiInterface;

  function mockAppSourceMetricState(promised: boolean = false, error: any = undefined) {
    (useAppSourceMetricState as jest.Mock).mockReturnValue(new AppSourceMetricService(metricState, appSourceApi));

    jest.spyOn(useAppSourceMetricState(), 'isPromised', 'get').mockReturnValue(promised);
    jest.spyOn(useAppSourceMetricState(), 'error', 'get').mockReturnValue(error);
  }

  beforeEach(() => {
    metricState = createState<AppSourceCountMetricDto>({
        id: '1',
        name: 'source1',
        endpoints: [{
          id: '3234234',
          path: '/place',
          sum: 2,
          method: 'GET'
        }],
        appClients: [{
          id: '13132',
          path: 'appclient1',
          sum: 1
        }]
    });
    appSourceApi = new MetricsControllerApi();
  });

  afterEach(() => {
    metricState.destroy();
  })

  it('should render the App Source Overview chart page', async () => {
    mockAppSourceMetricState();
    const page = render(
      <MemoryRouter>
        <MetricPage
          id="1"
          name="name"
          type={MetricType.APPSOURCE}
          method={undefined}
        />
      </MemoryRouter>
    );

    await waitFor(() => page.getByText('Requests By Endpoint in the last 30 days'));

    expect(page.getByText('Requests By Endpoint in the last 30 days')).toBeInTheDocument();
    expect(page.getByText('Requests By App Client in the last 30 days')).toBeInTheDocument();
  });

  it('should render endpoint specific chart', async () => {
    mockAppSourceMetricState();

    const page = render(
      <MemoryRouter>
        <MetricPage
          id="1"
          name="name"
          type={MetricType.ENDPOINT}
          method="GET"
        />
      </MemoryRouter>
    );

    await waitFor(() => page.getByText('SimpleEndpointMetricChart'));

    await expect(page.findByText('SimpleEndpointMetricChart')).resolves.toBeInTheDocument();

    expect(page.getByText('SimpleEndpointMetricChart')).toBeInTheDocument();
    expect(page.queryByText('SimpleAppClientMetricChart')).not.toBeInTheDocument();
  });

  it('should render app client specific chart', async () => {
    mockAppSourceMetricState();

    const page = render(
      <MemoryRouter>
        <MetricPage
          id="1"
          name="name"
          type={MetricType.APPCLIENT}
          method={undefined}
        />
      </MemoryRouter>
    );

    await waitFor(() => page.getByText('SimpleAppClientMetricChart'));

    await expect(page.findByText('SimpleAppClientMetricChart')).resolves.toBeInTheDocument();

    expect(page.getByText('SimpleAppClientMetricChart')).toBeInTheDocument();
    expect(page.queryByText('SimpleEndpointMetricChart')).not.toBeInTheDocument();
  });

  it('should redirect to not found on error', () => {
    mockAppSourceMetricState(false, { message: 'error status' });

    const {
      getByText
    } = render(
      <MemoryRouter>
        <MetricPage
          id="1"
          name="name"
          type={MetricType.APPCLIENT}
          method={undefined}
        />
        <Route path={RoutePath.NOT_FOUND}>404</Route>
      </MemoryRouter>
    );

    expect(getByText('404')).toBeInTheDocument();
  });

  it('should show spinner when promised', () => {
    mockAppSourceMetricState(true);

    const page = render(
      <MemoryRouter>
        <MetricPage
          id="1"
          name="name"
          type={MetricType.APPCLIENT}
          method={undefined}
        />
      </MemoryRouter>
    );

    expect(page.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render app client chart on click', async () => {
    mockAppSourceMetricState();

    const appClientChartPage = 'App Client Chart Page';
    const page = render(
      <MemoryRouter>
        <MetricPage
          id="1"
          name="name"
          type={MetricType.APPSOURCE}
          method={undefined}
        />
        <Route path={generateMetricsLink("1", MetricType.APPCLIENT, metricState.get().appClients![0].path, undefined)}>{appClientChartPage}</Route>
      </MemoryRouter>
    );

    const { getByText } = page;

    await waitFor(() => getByText('Requests By App Client in the last 30 days'));

    const chartTitle = getByText('Requests By App Client in the last 30 days');
    expect(chartTitle).toBeInTheDocument();

    const dataPointSelectionButton = getByText('dataPointSelection - Requests By App Client in the last 30 days').closest('button');
    expect(dataPointSelectionButton).toBeInTheDocument();

    fireEvent.click(dataPointSelectionButton!);

    await expect(page.findByText(appClientChartPage)).resolves.toBeInTheDocument();
  });

  it('should render endpoint chart on click', async () => {
    mockAppSourceMetricState();

    const endpointChartPage = 'App Client Chart Page';
    const endpoint = metricState.get().endpoints![0];
    const page = render(
      <MemoryRouter>
        <MetricPage
          id="1"
          name="name"
          type={MetricType.APPSOURCE}
          method={undefined}
        />
        <Route path={generateMetricsLink("1", MetricType.ENDPOINT, endpoint.path, endpoint.method as RequestMethod)}>{endpointChartPage}</Route>
      </MemoryRouter>
    );

    const { getByText } = page;

    await waitFor(() => getByText('Requests By Endpoint in the last 30 days'));

    const chartTitle = getByText('Requests By Endpoint in the last 30 days');
    expect(chartTitle).toBeInTheDocument();

    const dataPointSelectionButton = getByText('dataPointSelection - Requests By Endpoint in the last 30 days').closest('button');
    expect(dataPointSelectionButton).toBeInTheDocument();

    fireEvent.click(dataPointSelectionButton!);

    await expect(page.findByText(endpointChartPage)).resolves.toBeInTheDocument();
  });
})
