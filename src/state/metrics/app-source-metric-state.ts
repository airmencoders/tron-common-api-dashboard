import { createState, State, useState } from '@hookstate/core';
import { AppSourceCountMetricDto, MetricsControllerApi, MetricsControllerApiInterface } from '../../openapi';
import AppSourceMetricService from './app-source-metric-service';
import { globalOpenapiConfig } from '../../api/openapi-config';

const appSourceMetricState = createState<AppSourceCountMetricDto>({});
const metricsControllerApi = new MetricsControllerApi(
  globalOpenapiConfig.configuration,
  globalOpenapiConfig.basePath,
  globalOpenapiConfig.axios
);

export const wrapAppSourceMetricState = (state: State<AppSourceCountMetricDto>, metricsApi: MetricsControllerApiInterface): AppSourceMetricService => {
  return new AppSourceMetricService(state, metricsApi);
}

export const useAppSourceMetricState = (): AppSourceMetricService => wrapAppSourceMetricState(useState(appSourceMetricState), metricsControllerApi);
