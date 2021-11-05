import { createState, State, useState } from '@hookstate/core';
import { AppClientCountMetricDto, MetricsControllerApi, MetricsControllerApiInterface } from '../../openapi';
import AppClientUserMetricService from './app-client-user-metric-service';
import { globalOpenapiConfig } from '../../api/openapi-config';

const appClientMetricState = createState<AppClientCountMetricDto>({});
const metricsControllerApi = new MetricsControllerApi(
  globalOpenapiConfig.configuration,
  globalOpenapiConfig.basePath,
  globalOpenapiConfig.axios
);

export const wrapAppClientMetricState = (state: State<AppClientCountMetricDto>, metricsApi: MetricsControllerApiInterface): AppClientUserMetricService => {
  return new AppClientUserMetricService(state, metricsApi);
}

export const useAppClientMetricState = (): AppClientUserMetricService => wrapAppClientMetricState(useState(appClientMetricState), metricsControllerApi);
