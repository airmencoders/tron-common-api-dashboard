import { createState, State, useState } from '@hookstate/core';
import Config from '../../api/config';
import { AppClientCountMetricDto, Configuration, MetricsControllerApi, MetricsControllerApiInterface } from '../../openapi';
import AppClientUserMetricService from './app-client-user-metric-service';



const appClientMetricState = createState<AppClientCountMetricDto>({});
const metricsApi = new MetricsControllerApi(new Configuration({
  basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX
}));

export const wrapAppClientMetricState = (state: State<AppClientCountMetricDto>, metricsApi: MetricsControllerApiInterface): AppClientUserMetricService => {
  return new AppClientUserMetricService(state, metricsApi);
}

export const useAppClientMetricState = (): AppClientUserMetricService => wrapAppClientMetricState(useState(appClientMetricState), metricsApi);
