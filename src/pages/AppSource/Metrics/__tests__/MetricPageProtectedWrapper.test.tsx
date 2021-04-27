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
import { MetricPageProtectedWrapper } from '../MetricPageProtectedWrapper';
import { routerTestProps } from '../../../../utils/TestUtils/react-router-context-utils';

jest.mock('../../../../state/metrics/app-source-metric-state');
jest.mock('../SimpleEndpointMetricChart', () => () => <div>SimpleEndpointMetricChart</div>);
jest.mock('../SimpleAppClientMetricChart', () => () => <div>SimpleAppClientMetricChart</div>);
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
      return <div>{props.options.title?.text}
        <button onClick={() => {
          props.options.chart!.events!.dataPointSelection!(null, null, { w: { config: props.options }, dataPointIndex: 0 })
        }}>
          dataPointSelection - {props.options.title?.text}
        </button>
        <div>{props.options.title?.text} - data.length = {props.series[0].data.toString()}</div>
      </div>
    },
  }
});

describe('Test Protected Metric Page', () => {
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

  it('should render the metric page', async () => {
    mockAppSourceMetricState();

    const { history, location, match } = routerTestProps(RoutePath.APP_SOURCE_METRIC, { id: '1', type: MetricType.APPSOURCE.toString(), name: 'test', method: 'GET' as RequestMethod });

    const page = render(
      <MemoryRouter>
        <MetricPageProtectedWrapper
          history={history}
          location={location}
          match={match}
        />
      </MemoryRouter>
    );

    await waitFor(() => page.getByText('Requests By Endpoint in the last 30 days'));

    expect(page.getByText('Requests By Endpoint in the last 30 days')).toBeInTheDocument();
    expect(page.getByText('Requests By App Client in the last 30 days')).toBeInTheDocument();
  });

  it('should redirect to NOT_FOUND page on invalid metric type', async () => {
    mockAppSourceMetricState();

    const { history, location, match } = routerTestProps(RoutePath.APP_SOURCE_METRIC, { id: '1', type: 'invalid metric type', name: 'test', method: 'GET' as RequestMethod });

    const page = render(
      <MemoryRouter>
        <MetricPageProtectedWrapper
          history={history}
          location={location}
          match={match}
        />
        <Route path={RoutePath.NOT_FOUND}>404</Route>
      </MemoryRouter>
    );

    await expect(page.findByText('404')).resolves.toBeInTheDocument();
  });
})
