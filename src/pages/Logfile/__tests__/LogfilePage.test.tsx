import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LogfilePage } from '../LogfilePage';
import { useLogfileState, usePastLogfileState } from '../../../state/logfile/logfile-state';
import CurrentLogfileService from '../../../state/logfile/current-logfile-service';
import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { CurrentLogfileState } from '../../../state/logfile/current-logfile-state.ts';
import LogfileActuatorApi from '../../../api/logfile/logfile-actuator-api';
import { LogfileDto } from '../../../api/logfile/logfile-dto';
import LogfileApi from '../../../api/logfile/logfile-api';
import PastLogfileService from '../../../state/logfile/past-logfile-service';
import { AxiosResponse } from 'axios';

jest.mock('../../../state/logfile/logfile-state');

describe('Test Logfile Page', () => {
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

  const logfileDtos: Array<LogfileDto> = [
    {
      name: 'spring.log',
      downloadUri: 'http://localhost:8088/api/v1/logfile/spring.log'
    },
    {
      name: 'spring.log.2021-02-17.0.gz',
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

  let currentLogfileState: State<CurrentLogfileState> & StateMethodsDestroy;
  let currentLogfileApi: LogfileActuatorApi;

  let pastLogfileState: State<LogfileDto[]> & StateMethodsDestroy;
  let pastLogfileapi: LogfileApi;

  beforeEach(() => {
    currentLogfileState = createState<CurrentLogfileState>({
      ...initialLogfileState
    });
    currentLogfileApi = new LogfileActuatorApi();

    pastLogfileState = createState<LogfileDto[]>(new Array<LogfileDto>());
    pastLogfileapi = new LogfileApi();
  });

  it('Test Loading Page', async () => {
    function mockLogfileState() {
      (useLogfileState as jest.Mock).mockReturnValue(new CurrentLogfileService(currentLogfileState, currentLogfileApi));
      (usePastLogfileState as jest.Mock).mockReturnValue(new PastLogfileService(pastLogfileState, pastLogfileapi));

      jest.spyOn(useLogfileState(), 'isLoading', 'get').mockReturnValue(true);
      jest.spyOn(usePastLogfileState(), 'isPromised', 'get').mockReturnValue(true);
    }

    mockLogfileState();

    const page = render(
      <MemoryRouter>
        <LogfilePage />
      </MemoryRouter>
    );

    expect(page.getByText(/Loading.../i)).toBeDefined();
  });

  it('Test Error Page', async () => {
    function mockLogfileState() {
      (useLogfileState as jest.Mock).mockReturnValue(new CurrentLogfileService(currentLogfileState, currentLogfileApi));
      (usePastLogfileState as jest.Mock).mockReturnValue(new PastLogfileService(pastLogfileState, pastLogfileapi));

      jest.spyOn(useLogfileState(), 'error', 'get').mockReturnValue('Error');
      jest.spyOn(usePastLogfileState(), 'error', 'get').mockReturnValue('Error');
    }

    mockLogfileState();

    const page = render(
      <MemoryRouter>
        <LogfilePage />
      </MemoryRouter>
    );

    expect(page.getByText('error')).toBeDefined();
  });

  it('Test Fully Loaded Page', async () => {
    window.HTMLElement.prototype.scrollIntoView = function () { };

    function mockLogfileState() {
      (useLogfileState as jest.Mock).mockReturnValue(new CurrentLogfileService(currentLogfileState, currentLogfileApi));
      (usePastLogfileState as jest.Mock).mockReturnValue(new PastLogfileService(pastLogfileState, pastLogfileapi));

      jest.spyOn(useLogfileState(), 'isLoading', 'get').mockReturnValue(false);
      jest.spyOn(usePastLogfileState(), 'isPromised', 'get').mockReturnValue(false);

      pastLogfileState.set(logfileDtos);
      currentLogfileState.logs.set(['Test']);
    }

    mockLogfileState();

    const page = render(
      <MemoryRouter>
        <LogfilePage />
      </MemoryRouter>
    );

    expect(page.getByText(/Current Logfile/i)).toBeDefined();
    expect(page.getByText('Logs Download')).toBeDefined();
    fireEvent.click(page.getByText('Show Downloads'));
    fireEvent.click(page.getByText('Close'));
    expect(page.getByText('Test')).toBeDefined();
  });
})
