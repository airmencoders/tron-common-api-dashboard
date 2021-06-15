import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { AxiosResponse } from 'axios';
import Config from '../../../api/configuration';
import { Configuration, HttpLogDtoPaginationResponseWrapper, HttpLogEntryDto, HttpLogsControllerApi } from '../../../openapi';
import AuditLogService from '../audit-log-service';
import { httpLogApi, SearchLogParams, wrapState } from '../audit-log-state';

describe('Dashboard User State Test', () => {
  let auditLogState: State<HttpLogEntryDto[]> & StateMethodsDestroy;
  let auditLogApi: HttpLogsControllerApi = new HttpLogsControllerApi(new Configuration({ basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX }));;
  let searchParamsState: State<SearchLogParams> & StateMethodsDestroy;
  let service: AuditLogService;

  const data: HttpLogEntryDto[] = [
    {
      
    }
  ];

  const params: SearchLogParams = {} as SearchLogParams;

  const axiosGetResponse: AxiosResponse = {
    data: { data: data },
    status: 200,
    statusText: 'OK',
    config: {},
    headers: {}
  };

  beforeEach(async () => {
    auditLogState = createState<HttpLogEntryDto[]>(new Array<HttpLogEntryDto>());
    auditLogApi = new HttpLogsControllerApi();
    searchParamsState = createState<SearchLogParams>(params);
    service = wrapState(auditLogState, auditLogApi, searchParamsState);
  });

  afterEach(() => {
    auditLogState.destroy();
    searchParamsState.destroy();
  });

  it('Test fetch and store', async () => {
    expect(service.fetchAndStoreData()).rejects.toMatch(/Cannot/);   
  });

  it('Test sendUpdate', async () => {
    expect(service.sendUpdate({} as HttpLogEntryDto)).rejects.toMatch(/Cannot/);   
  });
 
  it('Test sendCreate', async () => {
    expect(service.sendCreate({} as HttpLogEntryDto)).rejects.toMatch(/Cannot/);   
  }); 

  it('Test sendDelete', async () => {
    expect(service.sendDelete({} as HttpLogEntryDto)).rejects.toMatch(/Cannot/);   
  });

  it('Test fetch paginated data', async () => {
    httpLogApi.getHttpLogs = jest.fn((date) => {
      return new Promise<AxiosResponse<HttpLogDtoPaginationResponseWrapper>>(resolve => resolve(axiosGetResponse));
    });

    const entries = await service.fetchAndStorePaginatedData(0, 100, true, undefined, undefined);
    expect(entries).toHaveLength(1);
  });  
});