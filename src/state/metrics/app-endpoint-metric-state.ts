import { createState, State, useState } from '@hookstate/core';
import { AppEndpointCountMetricDto, MetricsControllerApi, MetricsControllerApiInterface } from '../../openapi';
import AppEndpointMetricService from './app-endpoint-metric-service';
import { globalOpenapiConfig } from '../../api/openapi-config';

const appEndpointMetricState = createState<AppEndpointCountMetricDto>({
  path: '',
  requestType: ''
});
const metricsControllerApi = new MetricsControllerApi(
  globalOpenapiConfig.configuration,
  globalOpenapiConfig.basePath,
  globalOpenapiConfig.axios
);

export const wrapAppEndpointMetricState = (state: State<AppEndpointCountMetricDto>, metricsApi: MetricsControllerApiInterface): AppEndpointMetricService => {
  return new AppEndpointMetricService(state, metricsApi);
}

export const useAppEndpointMetricState = (): AppEndpointMetricService => wrapAppEndpointMetricState(useState(appEndpointMetricState), metricsControllerApi);
