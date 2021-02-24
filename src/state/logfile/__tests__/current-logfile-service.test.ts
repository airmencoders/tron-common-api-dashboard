import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { AxiosResponse } from 'axios';
import { CurrentLogfileState } from '../current-logfile-state.ts';
import LogfileActuatorApi from '../../../api/logfile/logfile-actuator-api';
import CurrentLogfileService from '../current-logfile-service';
import { wrapCurrentLogfileState } from '../logfile-state';

describe('Current Logfile Service Tests', () => {
  const initialLogfileState: CurrentLogfileState = {
    logs: new Array<string>(),
    maxLines: 5000,
    start: 0,
    end: 0,
    length: 0,
    refreshRate: 2000,
    loading: false,
    errors: undefined
  };

  const getLogfileResponse: AxiosResponse<string> = {
    data: 'Test',
    status: 200,
    statusText: 'OK',
    config: {},
    headers: {
      'content-range': '1000-2000/4000'
    }
  };

  const getLogfileStartResponse: AxiosResponse<string> = {
    data: 'Test 2',
    status: 200,
    statusText: 'OK',
    config: {},
    headers: {
      'content-range': '5000-7000/8000'
    }
  }

  let currentLogfileState: State<CurrentLogfileState> & StateMethodsDestroy;
  let currentLogfileApi: LogfileActuatorApi;
  let service: CurrentLogfileService;

  beforeEach(() => {
    currentLogfileState = createState<CurrentLogfileState>({
      ...initialLogfileState
    });
    currentLogfileApi = new LogfileActuatorApi();
    service = wrapCurrentLogfileState(currentLogfileState, currentLogfileApi);
  });

  afterEach(() => {
    currentLogfileState.destroy();
  })

  it('Test fetch and store', async () => {
    currentLogfileApi.getLogfile = jest.fn(() => {
      return new Promise<AxiosResponse<string>>(resolve => resolve(getLogfileResponse));
    });

    currentLogfileApi.getLogfileStart = jest.fn(() => {
      return new Promise<AxiosResponse<string>>(resolve => resolve(getLogfileStartResponse));
    });

    await service.fetchAndStoreCurrentLogfile();
    expect(service.getCurrentLog).toEqual([getLogfileResponse.data]);

    await service.fetchAndStoreCurrentLogfile();
    expect(service.getCurrentLog).toEqual([getLogfileResponse.data, getLogfileStartResponse.data]);
  });

  it('Test fetch and store errors', async () => {
    // Test for bad range (log file was archived)
    const rangeErrorResponse: AxiosResponse<string> = {
      data: 'Test 1',
      status: 416,
      statusText: 'Range Not Satisfiable',
      config: {},
      headers: {
        'content-range': '*/9000'
      }
    };

    currentLogfileApi.getLogfile = jest.fn(() => {
      return new Promise<AxiosResponse<string>>((resolve, reject) => reject({ response: rangeErrorResponse }));
    });

    await service.fetchAndStoreCurrentLogfile();
    expect(currentLogfileState.start.get()).toEqual(0);
    expect(currentLogfileState.end.get()).toEqual(0);
    expect(currentLogfileState.length.get()).toEqual(0);
    expect(currentLogfileState.errors.get()).toBeUndefined();

    // Test error
    const errorResponse: AxiosResponse<string> = {
      data: 'Test 2',
      status: 400,
      statusText: 'Bad Request',
      config: {},
      headers: {}
    };

    currentLogfileApi.getLogfile = jest.fn(() => {
      return new Promise<AxiosResponse<string>>((resolve, reject) => reject({ message: errorResponse.status + ' ' + errorResponse.statusText }));
    });

    await service.fetchAndStoreCurrentLogfile();
    expect(service.error).not.toBeUndefined();
  });

  it('Test fetch and store over message limit', async () => {
    const data = "test\ntest1\ntest2\ntest3\ntest4\ntest5\ntest6\n"
    const response: AxiosResponse<string> = {
      ...getLogfileResponse,
      data
    };

    currentLogfileApi.getLogfile = jest.fn(() => {
      return new Promise<AxiosResponse<string>>((resolve) => resolve(response));
    });

    currentLogfileState.maxLines.set(5);

    await service.fetchAndStoreCurrentLogfile();
    expect(currentLogfileState.logs.get().length).toEqual(5);
  });

  it('Test parseContentRangeHeader', () => {
    // @ts-ignore
    let result = service.parseContentRangeHeader('*/9000');
    expect(result).toEqual({
      start: '9000',
      end: '9000',
      length: '9000'
    });

    // @ts-ignore
    expect(() => service.parseContentRangeHeader('*/9000/9000')).toThrow();

    // @ts-ignore
    expect(() => service.parseContentRangeHeader('9000-10000-1000/9000')).toThrow();

    // @ts-ignore
    expect(() => service.parseContentRangeHeader('')).toThrow();

  });

  it('Test isLoading', async () => {
    currentLogfileApi.getLogfile = jest.fn(() => {
      return new Promise<AxiosResponse<string>>(resolve => setTimeout(() => resolve(getLogfileResponse), 1000));
    });

    expect(service.isLoading).toBeFalsy();

    const result = service.fetchAndStoreCurrentLogfile();

    expect(service.isLoading).toBeTruthy();

    await result;
    expect(service.isLoading).toBeFalsy();
  });

  it('Test isLoading', () => {
    expect(service.getRefreshRate).toEqual(initialLogfileState.refreshRate);
  });

  it('Test clearState', () => {
    currentLogfileState.start.set(100);
    expect(currentLogfileState.start.get()).toEqual(100);

    service.clearState();

    expect(currentLogfileState.get()).toEqual(initialLogfileState);
  });
});