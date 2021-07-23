import { createState, State, useState } from '@hookstate/core';
import Config from '../../api/config';
import { Configuration, KpiControllerApi, KpiControllerApiInterface, KpiSummaryDto } from '../../openapi';
import KpiService from './kpi-service';

const kpiState = createState<KpiSummaryDto>({});
const kpiApi: KpiControllerApiInterface = new KpiControllerApi(
  new Configuration({ basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX })
);

export const wrapKpiState = (state: State<KpiSummaryDto>, appClientApi: KpiControllerApiInterface): KpiService => {
  return new KpiService(state, appClientApi);
};

export const useKpiState = () => wrapKpiState(useState(kpiState), kpiApi);
export const accessKpiState = () => wrapKpiState(kpiState, kpiApi);