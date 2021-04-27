import { createState, State, StateMethodsDestroy } from "@hookstate/core";
import { render, waitFor } from "@testing-library/react";
import { ApexOptions } from "apexcharts";
import { MemoryRouter } from "react-router";
import { AppClientCountMetricDto, MetricsControllerApi, MetricsControllerApiInterface } from "../../../../openapi";
import AppClientUserMetricService from "../../../../state/metrics/app-client-user-metric-service";
import { useAppClientMetricState } from "../../../../state/metrics/app-client-user-metric-state";
import SimpleAppClientMetricChart from "../SimpleAppClientMetricChart";

jest.mock('../../../../state/metrics/app-client-user-metric-state');
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
  let metricState: State<AppClientCountMetricDto> & StateMethodsDestroy;
  let appSourceApi: MetricsControllerApiInterface;
  let selectedSourceState: State<{appSourceId: string; name: string; type: string}> & StateMethodsDestroy;
  const clickFunction = (config: any) => null;



  beforeEach(() => {
    metricState = createState<AppClientCountMetricDto>({
        id: '1',
        name: 'source1',
        endpoints: [{
          id: '3234234',
          path: '/place',
          sum: 2,
          method: 'GET'
        }],
    });
    appSourceApi = new MetricsControllerApi();
    selectedSourceState = createState({appSourceId: '1234', name: '', type: 'appsource'});
  });

  
  it('should render the page', async () => {
    function mockAppSourceMetricState() {
        (useAppClientMetricState as jest.Mock).mockReturnValue(new AppClientUserMetricService(metricState, appSourceApi));

        jest.spyOn(useAppClientMetricState(), 'isPromised', 'get').mockReturnValue(true);
    }
    mockAppSourceMetricState();
    const page = render(
      <MemoryRouter>
        <SimpleAppClientMetricChart
          id="1"
          name="name"
          onClick={clickFunction} />
      </MemoryRouter>
    );

    await waitFor(() => page.getByText('Loading...'));

    expect(page.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render the chart', async () => {
    function mockAppSourceMetricState() {
        (useAppClientMetricState as jest.Mock).mockReturnValue(new AppClientUserMetricService(metricState, appSourceApi));

        jest.spyOn(useAppClientMetricState(), 'isPromised', 'get').mockReturnValue(false);
    }
    mockAppSourceMetricState();
    const page = render(
      <MemoryRouter>
        <SimpleAppClientMetricChart
          id="1"
          name="name"
          onClick={clickFunction} />
      </MemoryRouter>
    );

    await waitFor(() => page.getByText('Requests By Endpoint in the last 30 days'));

    expect(page.queryByText('Requests By App Client in the last 30 days')).not.toBeInTheDocument();
    expect(page.getByText('Requests By Endpoint in the last 30 days')).toBeInTheDocument();
  });
})
