import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { ApexOptions } from 'apexcharts';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AppSourceCountMetricDto, MetricsControllerApi, MetricsControllerApiInterface } from '../../../../openapi';
import AppSourceMetricService from '../../../../state/metrics/app-source-metric-service';
import { useAppSourceMetricState } from '../../../../state/metrics/app-source-metric-state';
import { MetricPage } from '../MetricPage';

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
  let selectedSourceState: State<{appSourceId: string; name: string; type: string}> & StateMethodsDestroy;
  let title: string;
  let link: JSX.Element | undefined;
  const titleChange = (newTitle: string) => title = newTitle;
  const linkChange = (newElement: JSX.Element | undefined) => link = newElement;

  function mockAppSourceMetricState() {
    (useAppSourceMetricState as jest.Mock).mockReturnValue(new AppSourceMetricService(metricState, appSourceApi));

    jest.spyOn(useAppSourceMetricState(), 'isPromised', 'get').mockReturnValue(false);
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
    selectedSourceState = createState({appSourceId: '1234', name: '', type: 'appsource'});
  });

  it('should render the page', async () => {
    mockAppSourceMetricState();
    const page = render(
      <MemoryRouter>
        <MetricPage
          id="1"
          name="name"
          titleChange={titleChange}
          linkChange={linkChange} />
      </MemoryRouter>
    );

    await waitFor(() => page.getByText('Requests By Endpoint in the last 30 days'));

    expect(page.getByText('Requests By Endpoint in the last 30 days')).toBeInTheDocument();
    expect(page.getByText('Requests By App Client in the last 30 days')).toBeInTheDocument();
  });

  it('should change to rendering the endpoint specific chart', async () => {
    mockAppSourceMetricState();

    const page = render(
      <MemoryRouter>
        <MetricPage
          id="1"
          name="name"
          titleChange={titleChange}
          linkChange={linkChange} />
      </MemoryRouter>
    );

    // Click the mock button to fire handleOnClickChartEventEndpoint
    const dataPointSelectionButton = (await page.findByText('dataPointSelection - Requests By Endpoint in the last 30 days')).closest('button');
    expect(dataPointSelectionButton).not.toBeNull();
    fireEvent.click(dataPointSelectionButton!);

    await waitFor(() => page.getByText('SimpleEndpointMetricChart'));

    await expect(page.findByText('SimpleEndpointMetricChart')).resolves.toBeInTheDocument();

    expect(page.getByText('SimpleEndpointMetricChart')).toBeInTheDocument();
    expect(page.queryByText('SimpleAppClientMetricChart')).not.toBeInTheDocument();
  });

  it('should change to rendering the app client specific chart', async () => {
    mockAppSourceMetricState();

    const page = render(
      <MemoryRouter>
        <MetricPage
          id="1"
          name="name"
          titleChange={titleChange}
          linkChange={linkChange} />
      </MemoryRouter>
    );

    // Click the mock button to fire handleOnClickChartEventAppClient
    const dataPointSelectionButton = (await page.findByText('dataPointSelection - Requests By App Client in the last 30 days')).closest('button');
    expect(dataPointSelectionButton).not.toBeNull();
    fireEvent.click(dataPointSelectionButton!);

    await waitFor(() => page.getByText('SimpleAppClientMetricChart'));

    await expect(page.findByText('SimpleAppClientMetricChart')).resolves.toBeInTheDocument();

    expect(page.getByText('SimpleAppClientMetricChart')).toBeInTheDocument();
    expect(page.queryByText('SimpleEndpointMetricChart')).not.toBeInTheDocument();
  });
})
