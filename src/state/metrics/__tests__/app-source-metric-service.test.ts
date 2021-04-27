import { createState, State, StateMethodsDestroy } from "@hookstate/core";
import { AxiosResponse } from "axios";
import { AppSourceCountMetricDto, MetricsControllerApi, MetricsControllerApiInterface } from "../../../openapi";
import AppSourceMetricService from "../app-source-metric-service";
import { wrapAppSourceMetricState } from "../app-source-metric-state";

describe('App Source Metric State', () => {

  let appSourceMetricState: State<AppSourceCountMetricDto> & StateMethodsDestroy;
  let metricsApi: MetricsControllerApiInterface;
  let wrappedState: AppSourceMetricService;

  const appSourceMetricDto: AppSourceCountMetricDto = {
    id: '1234',
    name: 'test-name',
    endpoints: [{
      id: '645345',
      sum: 3,
      path: '/place'
    }],
    appClients: [{
      id: '234323',
      sum: 3,
      path: 'app client'
    }]
  };

  const axiosGetAppSourceMetricDtosResponse: AxiosResponse = {
    data: appSourceMetricDto,
    status: 200,
    statusText: 'OK',
    config: {},
    headers: {}
  };

  beforeEach(() => {
    appSourceMetricState = createState<AppSourceCountMetricDto>({});
    metricsApi = new MetricsControllerApi();
    wrappedState = wrapAppSourceMetricState(appSourceMetricState, metricsApi);
  });

  afterEach(() => {
    appSourceMetricState.destroy();
  });

  it('should fetch and store', async () => {
    metricsApi.getCountOfMetricsForAppSource = jest.fn(() => {
      return new Promise<AxiosResponse<AppSourceCountMetricDto>>(resolve => resolve(axiosGetAppSourceMetricDtosResponse));
    });

    await wrappedState.fetchAndStoreAppSourceData('1234');

    expect(wrappedState.appSourceMetric).toEqual(appSourceMetricDto);
  });

  it('Test appSourceMetrica', async () => {
    metricsApi.getCountOfMetricsForAppSource = jest.fn(() => {
      return new Promise<AxiosResponse<AppSourceCountMetricDto>>(resolve => setTimeout(() => resolve(axiosGetAppSourceMetricDtosResponse), 200));
    });

    const fetch = wrappedState.fetchAndStoreAppSourceData('1234');
    expect(wrappedState.appSourceMetric).toEqual({});

    await fetch;
    expect(wrappedState.appSourceMetric).toEqual(appSourceMetricDto);
  });

  it('Test error', async () => {
    const failMessage = 'failed';
    metricsApi.getCountOfMetricsForAppSource = jest.fn(() => {
      return new Promise<AxiosResponse<AppSourceCountMetricDto>>((resolve, reject) => {
        setTimeout(() => {
          reject(failMessage)
        }, 200)
      });
    });

    const fetch = wrappedState.fetchAndStoreAppSourceData('1234');
    expect(wrappedState.error).toBe(undefined);

    await expect(fetch).rejects.toEqual(failMessage);
    expect(wrappedState.error).toBe(failMessage);
  });
});