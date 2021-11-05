import { createState, State, useState } from '@hookstate/core';
import { globalOpenapiConfig } from '../../api/openapi-config';
import { HttpLogsControllerApi } from '../../openapi';
import { HttpLogEntryDto } from '../../openapi/models';
import AuditLogService from './audit-log-service';
import { getDefaultSearchLogParams, SearchLogParams } from './search-log-params';

const auditLogState = createState<HttpLogEntryDto[]>(new Array<HttpLogEntryDto>());
const auditLogSearchParams = createState<SearchLogParams>(getDefaultSearchLogParams());

export const httpLogApi: HttpLogsControllerApi = new HttpLogsControllerApi(
  globalOpenapiConfig.configuration,
  globalOpenapiConfig.basePath,
  globalOpenapiConfig.axios
);

export const wrapState = (state: State<HttpLogEntryDto[]>, 
                          httpLogControllerApi: HttpLogsControllerApi,
                          searchParamsState: State<SearchLogParams>
                          ) => {
  return new AuditLogService(state, searchParamsState, httpLogControllerApi);
};

export const useAuditLogState = () => 
      wrapState(useState(auditLogState), 
                httpLogApi, 
                useState(auditLogSearchParams)                
);