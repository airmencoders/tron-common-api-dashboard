import { createState, State, useState } from '@hookstate/core';
import format from 'date-fns/format';
import Config from '../../api/configuration';
import {
  Configuration,
  HttpLogsControllerApi
} from '../../openapi';
import { HttpLogEntryDto } from '../../openapi/models';
import AuditLogService from './audit-log-service';

export type SearchLogParams = {
  date: string,
  requestMethod: string,
  requestedUrlContains: string,
  statusCode: string,    
  remoteIpContains: string, 
  hostContains: string,
  userAgentContains: string,
  queryStringContains: string,
  userNameContains: string,
};

const auditLogState = createState<HttpLogEntryDto[]>(new Array<HttpLogEntryDto>());
const auditLogSearchParams = createState<SearchLogParams>({
    date: format(new Date(), 'yyyy-MM-dd'),
    requestMethod: '',
    requestedUrlContains: '',
    statusCode: '',    
    remoteIpContains: '',
    hostContains: '',
    userAgentContains: '',
    queryStringContains: '',
    userNameContains: '',
} as SearchLogParams);

export const httpLogApi: HttpLogsControllerApi = new HttpLogsControllerApi(
    new Configuration({ basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX })
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