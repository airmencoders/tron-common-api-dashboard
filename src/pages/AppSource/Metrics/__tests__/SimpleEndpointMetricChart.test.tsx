import { createState, State, StateMethodsDestroy } from "@hookstate/core";
import { render, waitFor } from "@testing-library/react";
import { ApexOptions } from "apexcharts";
import { MemoryRouter } from "react-router";
import { AppEndpointCountMetricDto, EndpointCountMetricDto, MetricsControllerApi, MetricsControllerApiInterface } from "../../../../openapi";
import AppEndpointMetricService from "../../../../state/metrics/app-endpoint-metric-service";
import { useAppEndpointMetricState } from "../../../../state/metrics/app-endpoint-metric-state";
import SimpleEndpointMetricChart from "../SimpleEndpointMetricChart";

jest.mock('../../../../state/metrics/app-endpoint-metric-state');
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
  let metricState: State<AppEndpointCountMetricDto> & StateMethodsDestroy;
  let appSourceApi: MetricsControllerApiInterface;
  let selectedSourceState: State<{appSourceId: string; name: string; type: string}> & StateMethodsDestroy;
  const clickFunction = (config: any) => null;

  beforeEach(() => {
    metricState = createState<AppEndpointCountMetricDto>({
      id: '1',
      path: 'source1',
      requestType: 'GET',
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
    function mockAppSourceMetricState() {
        (useAppEndpointMetricState as jest.Mock).mockReturnValue(new AppEndpointMetricService(metricState, appSourceApi));

        jest.spyOn(useAppEndpointMetricState(), 'isPromised', 'get').mockReturnValue(true);
    }
    mockAppSourceMetricState();
    const page = render(
      <MemoryRouter>
        <SimpleEndpointMetricChart
          id="1"
          name="name"
          method="GET"
          onClick={clickFunction} />
      </MemoryRouter>
    );

    await waitFor(() => page.getByText('Loading...'));

    expect(page.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render the chart', async () => {
    function mockAppSourceMetricState() {
        (useAppEndpointMetricState as jest.Mock).mockReturnValue(new AppEndpointMetricService(metricState, appSourceApi));

        jest.spyOn(useAppEndpointMetricState(), 'isPromised', 'get').mockReturnValue(false);
    }
    mockAppSourceMetricState();
    const page = render(
      <MemoryRouter>
        <SimpleEndpointMetricChart
          id="1"
          name="name"
          method="GET"
          onClick={clickFunction} />
      </MemoryRouter>
    );

    await waitFor(() => page.getByText('Requests By App Client in the last 30 days'));

    expect(page.queryByText('Requests By Endpoint in the last 30 days')).not.toBeInTheDocument();
    expect(page.getByText('Requests By App Client in the last 30 days')).toBeInTheDocument();
  });
})
