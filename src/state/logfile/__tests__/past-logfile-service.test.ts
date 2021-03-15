import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { AxiosResponse } from 'axios';
import LogfileApi from '../../../api/logfile/logfile-api';
import PastLogfileService from '../past-logfile-service';
import { LogfileDto } from '../../../api/logfile/logfile-dto';
import { wrapPastLogfileState } from '../logfile-state';

describe('Current Logfile Service Tests', () => {
  const logfileDtos: Array<LogfileDto> = [
    {
      name: 'spring.log',
      downloadUri: 'http://localhost:8088/api/v1/logfile/spring.log'
    },
    {
      name: 'sspring.log.2021-02-17.0.gz',
      downloadUri: 'http://localhost:8088/api/v1/logfile/spring.log.2021-02-17.0.gz'
    }
  ];
  const getLogfilesResponse: AxiosResponse<LogfileDto[]> = {
    data: logfileDtos,
    status: 200,
    statusText: 'OK',
    config: {},
    headers: {}
  };

  let pastLogfileState: State<LogfileDto[]> & StateMethodsDestroy;
  let pastLogfileapi: LogfileApi;
  let service: PastLogfileService;

  beforeEach(() => {
    pastLogfileState = createState<LogfileDto[]>(new Array<LogfileDto>());
    pastLogfileapi = new LogfileApi();
    service = wrapPastLogfileState(pastLogfileState, pastLogfileapi);
  });

  afterEach(() => {
    pastLogfileState.destroy();
  })

  it('Test fetch and store', async () => {
    pastLogfileapi.getLogfiles = jest.fn(() => {
      return new Promise<AxiosResponse<LogfileDto[]>>(resolve => resolve(getLogfilesResponse));
    });

    await service.fetchAndStorePastLogfiles();

    expect(service.getPastLogs).toEqual(logfileDtos);
  });

  it('Test promised', async () => {
    pastLogfileapi.getLogfiles = jest.fn(() => {
      return new Promise<AxiosResponse<LogfileDto[]>>(resolve => setTimeout(() => resolve(getLogfilesResponse), 1000));
    });

    const result = service.fetchAndStorePastLogfiles();

    expect(service.isPromised).toBeTruthy();

    await result;
    expect(service.isPromised).toBeFalsy();
  });

  it('Test getPastLogs', async () => {
    pastLogfileapi.getLogfiles = jest.fn(() => {
      return new Promise<AxiosResponse<LogfileDto[]>>(resolve => setTimeout(() => resolve(getLogfilesResponse), 1000));
    });

    const result = service.fetchAndStorePastLogfiles();

    expect(service.getPastLogs).toEqual([]);

    await result;
    expect(service.getPastLogs).toEqual(logfileDtos);
  });

  it('Test error', async () => {
    const getLogfilesRejectResponse: AxiosResponse<LogfileDto[]> = {
      data: logfileDtos,
      status: 400,
      statusText: 'Bad Request',
      config: {},
      headers: {}
    };

    // Test no error
    pastLogfileapi.getLogfiles = jest.fn(() => {
      return new Promise<AxiosResponse<LogfileDto[]>>((resolve) => resolve(getLogfilesResponse));
    });

    await service.fetchAndStorePastLogfiles();
    expect(service.error).toBeUndefined();


    // Test error exists
    pastLogfileapi.getLogfiles = jest.fn(() => {
      return new Promise<AxiosResponse<LogfileDto[]>>((resolve, reject) => reject(getLogfilesRejectResponse));
    });
    await expect(service.fetchAndStorePastLogfiles()).rejects.toEqual(getLogfilesRejectResponse);
    expect(service.error).toEqual(getLogfilesRejectResponse);
  });
});