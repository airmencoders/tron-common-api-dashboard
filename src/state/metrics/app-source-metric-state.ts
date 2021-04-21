import { createState, State, useState } from '@hookstate/core';
import Config from '../../api/configuration';
import { AppSourceCountMetricDto, Configuration, MetricsControllerApi, MetricsControllerApiInterface } from '../../openapi';
import AppSourceMetricService from './app-source-metric-service';


const appSourceMetricState = createState<AppSourceCountMetricDto>({});
const metricsApi = new MetricsControllerApi(new Configuration({
  basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX
}));

export const wrapAppSourceMetricState = (state: State<AppSourceCountMetricDto>, metricsApi: MetricsControllerApiInterface): AppSourceMetricService => {
  return new AppSourceMetricService(state, metricsApi);
}

export const useAppSourceMetricState = (): AppSourceMetricService => wrapAppSourceMetricState(useState(appSourceMetricState), metricsApi);
