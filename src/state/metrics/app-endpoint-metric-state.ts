import { createState, State, useState } from '@hookstate/core';
import Config from '../../api/configuration';
import { Configuration, EndpointCountMetricDto, MetricsControllerApi, MetricsControllerApiInterface } from '../../openapi';
import AppEndpointMetricService from './app-endpoint-metric-service';


const appEndpointMetricState = createState<EndpointCountMetricDto>({});
const metricsApi = new MetricsControllerApi(new Configuration({
  basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX
}));

export const wrapAppEndpointMetricState = (state: State<EndpointCountMetricDto>, metricsApi: MetricsControllerApiInterface): AppEndpointMetricService => {
  return new AppEndpointMetricService(state, metricsApi);
}

export const useAppEndpointMetricState = (): AppEndpointMetricService => wrapAppEndpointMetricState(useState(appEndpointMetricState), metricsApi);
