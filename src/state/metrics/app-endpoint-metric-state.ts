import { createState, State, useState } from '@hookstate/core';
import Config from '../../api/config';
import { Configuration, AppEndpointCountMetricDto, MetricsControllerApi, MetricsControllerApiInterface } from '../../openapi';
import AppEndpointMetricService from './app-endpoint-metric-service';


const appEndpointMetricState = createState<AppEndpointCountMetricDto>({
  path: '',
  requestType: ''
});
const metricsApi = new MetricsControllerApi(new Configuration({
  basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX
}));

export const wrapAppEndpointMetricState = (state: State<AppEndpointCountMetricDto>, metricsApi: MetricsControllerApiInterface): AppEndpointMetricService => {
  return new AppEndpointMetricService(state, metricsApi);
}

export const useAppEndpointMetricState = (): AppEndpointMetricService => wrapAppEndpointMetricState(useState(appEndpointMetricState), metricsApi);
