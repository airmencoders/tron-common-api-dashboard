import { createState, State, useState } from '@hookstate/core';
import Config from '../../api/config';
import { openapiAxiosInstance } from '../../api/openapi-axios';
import {
  Configuration,
  HttpLogsControllerApi
} from '../../openapi';
import { HttpLogEntryDto } from '../../openapi/models';
import AuditLogService from './audit-log-service';
import { getDefaultSearchLogParams, SearchLogParams } from './search-log-params';

const auditLogState = createState<HttpLogEntryDto[]>(new Array<HttpLogEntryDto>());
const auditLogSearchParams = createState<SearchLogParams>(getDefaultSearchLogParams());

export const httpLogApi: HttpLogsControllerApi = new HttpLogsControllerApi(
  new Configuration({ basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX }), '', openapiAxiosInstance
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