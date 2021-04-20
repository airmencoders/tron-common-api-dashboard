import { createState, State, StateMethodsDestroy } from "@hookstate/core";
import { AxiosResponse } from "axios";
import { EndpointCountMetricDto, MetricsControllerApi, MetricsControllerApiInterface } from "../../../openapi";
import AppEndpointMetricService from "../app-endpoint-metric-service";
import { wrapAppEndpointMetricState } from "../app-endpoint-metric-state";

describe('App Endpoint Metric State', () => {

    let endpointMetricState: State<EndpointCountMetricDto> & StateMethodsDestroy;
    let metricsApi: MetricsControllerApiInterface;
    let wrappedState: AppEndpointMetricService;

    const endpointMetricDto: EndpointCountMetricDto = {
        id: '1234',
        path: 'test-name',
        appClients: [{
            id: '234323',
            sum: 3,
            path: 'app client 1'
        }]
    };

    const axiosGetAppSourceMetricDtosResponse: AxiosResponse = {
        data: endpointMetricDto,
        status: 200,
        statusText: 'OK',
        config: {},
        headers: {}
      };

    beforeEach(() => {
        endpointMetricState = createState<EndpointCountMetricDto>({});
        metricsApi = new MetricsControllerApi();
        wrappedState = wrapAppEndpointMetricState(endpointMetricState, metricsApi);
    });

    afterEach(() => {
        endpointMetricState.destroy();
      })

    it('should fetch and store', async () => {
        metricsApi.getCountOfMetricsForEndpoint = jest.fn(() => {
            return new Promise<AxiosResponse<EndpointCountMetricDto>>(resolve => resolve(axiosGetAppSourceMetricDtosResponse));
        });

        await wrappedState.fetchAndStoreAppSourceData('1234', 'app client 1');

        expect(wrappedState.countMetric).toEqual(endpointMetricDto);
    });

    it('Test countMetrica', async () => {
        metricsApi.getCountOfMetricsForEndpoint = jest.fn(() => {
          return new Promise<AxiosResponse<EndpointCountMetricDto>>(resolve => setTimeout(() => resolve(axiosGetAppSourceMetricDtosResponse), 1000));
        });
    
        const fetch = wrappedState.fetchAndStoreAppSourceData('1234', 'app client 1');
        expect(wrappedState.countMetric).toEqual({});
    
        await fetch;
        expect(wrappedState.countMetric).toEqual(endpointMetricDto);
    });

    it('Test error', async () => {
        const failMessage = 'failed';
        metricsApi.getCountOfMetricsForEndpoint = jest.fn(() => {
            return new Promise<AxiosResponse<EndpointCountMetricDto>>((resolve, reject) => {
                setTimeout(() => {
                    reject(failMessage)
                }, 1000)
            });
        });

        const fetch = wrappedState.fetchAndStoreAppSourceData('1234', 'app client 1');
        expect(wrappedState.error).toBe(undefined);

        await expect(fetch).rejects.toEqual(failMessage);
        expect(wrappedState.error).toBe(failMessage);
    });
});