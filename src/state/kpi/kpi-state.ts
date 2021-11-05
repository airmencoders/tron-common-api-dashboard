import { createState, State, useState } from '@hookstate/core';
import { KpiControllerApi, KpiControllerApiInterface, KpiSummaryDto } from '../../openapi';
import KpiService from './kpi-service';
import { globalOpenapiConfig } from '../../api/openapi-config';

const kpiState = createState<KpiSummaryDto | KpiSummaryDto[] | undefined>(undefined);
const kpiApi: KpiControllerApiInterface = new KpiControllerApi(
  globalOpenapiConfig.configuration,
  globalOpenapiConfig.basePath,
  globalOpenapiConfig.axios
);

export const wrapKpiState = (state: State<KpiSummaryDto | KpiSummaryDto[] | undefined>, appClientApi: KpiControllerApiInterface): KpiService => {
  return new KpiService(state, appClientApi);
};

export const useKpiState = () => wrapKpiState(useState(kpiState), kpiApi);
export const accessKpiState = () => wrapKpiState(kpiState, kpiApi);