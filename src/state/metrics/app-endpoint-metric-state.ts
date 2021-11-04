import { createState, State, useState } from '@hookstate/core';
import Config from '../../api/config';
import { openapiAxiosInstance } from '../../api/openapi-axios';
import { Configuration, AppEndpointCountMetricDto, MetricsControllerApi, MetricsControllerApiInterface } from '../../openapi';
import AppEndpointMetricService from './app-endpoint-metric-service';


const appEndpointMetricState = createState<AppEndpointCountMetricDto>({
  path: '',
  requestType: ''
});
const metricsControllerApi = new MetricsControllerApi(new Configuration({
  basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX
}), '', openapiAxiosInstance);

export const wrapAppEndpointMetricState = (state: State<AppEndpointCountMetricDto>, metricsApi: MetricsControllerApiInterface): AppEndpointMetricService => {
  return new AppEndpointMetricService(state, metricsApi);
}

export const useAppEndpointMetricState = (): AppEndpointMetricService => wrapAppEndpointMetricState(useState(appEndpointMetricState), metricsControllerApi);
