import { createState, State, StateMethodsDestroy } from "@hookstate/core";
import { AxiosResponse } from "axios";
import { AppEndpointCountMetricDto, MetricsControllerApi, MetricsControllerApiInterface } from "../../../openapi";
import AppEndpointMetricService from "../app-endpoint-metric-service";
import { wrapAppEndpointMetricState } from "../app-endpoint-metric-state";

describe('App Endpoint Metric State', () => {

  let endpointMetricState: State<AppEndpointCountMetricDto> & StateMethodsDestroy;
  let metricsApi: MetricsControllerApiInterface;
  let wrappedState: AppEndpointMetricService;

  const appEndpointMetricDto: AppEndpointCountMetricDto = {
    id: '1234',
    path: 'test-name',
    requestType: 'GET',
    appClients: [{
      id: '234323',
      sum: 3,
      path: 'app client 1',
    }]
  };

  const axiosGetAppSourceMetricDtosResponse: AxiosResponse = {
    data: appEndpointMetricDto,
    status: 200,
    statusText: 'OK',
    config: {},
    headers: {}
  };

  beforeEach(() => {
    endpointMetricState = createState<AppEndpointCountMetricDto>({ path: '', requestType: ''});
    metricsApi = new MetricsControllerApi();
    wrappedState = wrapAppEndpointMetricState(endpointMetricState, metricsApi);
  });

  afterEach(() => {
    endpointMetricState.destroy();
  });

  it('should fetch and store', async () => {
      metricsApi.getCountOfMetricsForEndpoint = jest.fn(() => {
        return new Promise<AxiosResponse<AppEndpointCountMetricDto>>(resolve => resolve(axiosGetAppSourceMetricDtosResponse));
      });

      await wrappedState.fetchAndStoreAppSourceData('1234', 'app client 1', 'GET');

      expect(wrappedState.countMetric).toEqual(appEndpointMetricDto);
  });

  it('Test countMetrica', async () => {
    metricsApi.getCountOfMetricsForEndpoint = jest.fn(() => {
      return new Promise<AxiosResponse<AppEndpointCountMetricDto>>(resolve => setTimeout(() => resolve(axiosGetAppSourceMetricDtosResponse), 200));
    });

    const fetch = wrappedState.fetchAndStoreAppSourceData('1234', 'app client 1', 'GET');
    expect(wrappedState.countMetric).toEqual({ path: '', requestType: ''});

    await fetch;
    expect(wrappedState.countMetric).toEqual(appEndpointMetricDto);
  });

  it('Test error', async () => {
    const failMessage = 'failed';
    metricsApi.getCountOfMetricsForEndpoint = jest.fn(() => {
      return new Promise<AxiosResponse<AppEndpointCountMetricDto>>((resolve, reject) => {
        setTimeout(() => {
          reject(failMessage)
        }, 200)
      });
    });

    const fetch = wrappedState.fetchAndStoreAppSourceData('1234', 'app client 1', 'GET');
    expect(wrappedState.error).toBe(undefined);

    await expect(fetch).rejects.toEqual(failMessage);
    expect(wrappedState.error).toBe(failMessage);
  });
});