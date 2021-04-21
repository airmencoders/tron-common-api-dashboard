import { createState, State, StateMethodsDestroy } from "@hookstate/core";
import { AxiosResponse } from "axios";
import { AppClientCountMetricDto, MetricsControllerApi, MetricsControllerApiInterface } from "../../../openapi";
import AppClientUserMetricService from "../app-client-user-metric-service";
import { wrapAppClientMetricState } from "../app-client-user-metric-state";

describe('App Endpoint Metric State', () => {

    let appClientMetricState: State<AppClientCountMetricDto> & StateMethodsDestroy;
    let metricsApi: MetricsControllerApiInterface;
    let wrappedState: AppClientUserMetricService;

    const endpointMetricDto: AppClientCountMetricDto = {
        id: '1234',
        name: 'test-name',
        endpoints: [{
            id: '234323',
            sum: 3,
            path: '/place/{id}'
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
        appClientMetricState = createState<AppClientCountMetricDto>({});
        metricsApi = new MetricsControllerApi();
        wrappedState = wrapAppClientMetricState(appClientMetricState, metricsApi);
    });

    afterEach(() => {
        appClientMetricState.destroy();
      })

    it('should fetch and store', async () => {
        metricsApi.getCountOfMetricsForAppClient = jest.fn(() => {
            return new Promise<AxiosResponse<AppClientCountMetricDto>>(resolve => resolve(axiosGetAppSourceMetricDtosResponse));
        });

        await wrappedState.fetchAndStoreAppSourceData('1234', 'app client 1');

        expect(wrappedState.countMetric).toEqual(endpointMetricDto);
    });

    it('Test countMetrica', async () => {
        metricsApi.getCountOfMetricsForAppClient = jest.fn(() => {
          return new Promise<AxiosResponse<AppClientCountMetricDto>>(resolve => setTimeout(() => resolve(axiosGetAppSourceMetricDtosResponse), 1000));
        });
    
        const fetch = wrappedState.fetchAndStoreAppSourceData('1234', 'app client 1');
        expect(wrappedState.countMetric).toEqual({});
    
        await fetch;
        expect(wrappedState.countMetric).toEqual(endpointMetricDto);
    });

    it('Test error', async () => {
        const failMessage = 'failed';
        metricsApi.getCountOfMetricsForAppClient = jest.fn(() => {
            return new Promise<AxiosResponse<AppClientCountMetricDto>>((resolve, reject) => {
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