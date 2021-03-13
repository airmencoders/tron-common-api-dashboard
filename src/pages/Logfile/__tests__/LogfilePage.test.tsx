import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useLogfileState, usePastLogfileState } from '../../../state/logfile/logfile-state';
import CurrentLogfileService from '../../../state/logfile/current-logfile-service';
import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { CurrentLogfileState } from '../../../state/logfile/current-logfile-state';
import LogfileActuatorApi from '../../../api/logfile/logfile-actuator-api';
import { LogfileDto } from '../../../api/logfile/logfile-dto';
import LogfileApi from '../../../api/logfile/logfile-api';
import PastLogfileService from '../../../state/logfile/past-logfile-service';
import LogfilePage from '../LogfilePage';

jest.mock('../../../state/logfile/logfile-state');

describe('Test Logfile Contents', () => {
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

  const logMessages: string[] = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse at tortor nisi. Aenean est ante, tincidunt vitae condimentum at, finibus et mi.'.split(' ');

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

  let currentLogfileState: State<CurrentLogfileState> & StateMethodsDestroy;
  let currentLogfileApi: LogfileActuatorApi;

  let pastLogfileState: State<LogfileDto[]> & StateMethodsDestroy;
  let pastLogfileApi: LogfileApi;

  beforeEach(() => {
    currentLogfileState = createState<CurrentLogfileState>({
      ...initialLogfileState
    });
    currentLogfileApi = new LogfileActuatorApi();

    pastLogfileState = createState<LogfileDto[]>(new Array<LogfileDto>());
    pastLogfileApi = new LogfileApi();
  });

  function mockLogfileStates() {
    (useLogfileState as jest.Mock).mockReturnValue(new CurrentLogfileService(currentLogfileState, currentLogfileApi));
    (usePastLogfileState as jest.Mock).mockReturnValue(new PastLogfileService(pastLogfileState, pastLogfileApi));
  }

  it('Test Error Page', async () => {
    mockLogfileStates();
    jest.spyOn(useLogfileState(), 'error', 'get').mockReturnValue('Error');
    jest.spyOn(usePastLogfileState(), 'error', 'get').mockReturnValue('Error');

    const page = render(
      <MemoryRouter>
        <LogfilePage />
      </MemoryRouter>
    );

    expect(page.getByText('error')).toBeDefined();
  });

  it('Test Fully Loaded Page', async () => {
    mockLogfileStates();
    jest.spyOn(useLogfileState(), 'isLoading', 'get').mockReturnValue(false);
    jest.spyOn(useLogfileState(), 'getCurrentLog', 'get').mockReturnValue(logMessages);
    jest.spyOn(useLogfileState(), 'getRefreshRate', 'get').mockReturnValue(1000);

    jest.spyOn(usePastLogfileState(), 'isPromised', 'get').mockReturnValue(false);
    jest.spyOn(usePastLogfileState(), 'getPastLogs', 'get').mockReturnValue(logfileDtos);

    jest.useFakeTimers();

    window.HTMLElement.prototype.scrollTo = function () { };

    const page = render(
      <MemoryRouter>
        <LogfilePage />
      </MemoryRouter>
    );

    jest.runOnlyPendingTimers();

    expect(page.getByText('Current Logfile')).toBeDefined();
    logMessages.forEach(msg => {
      expect(page.getByText(msg)).toBeDefined();
    })

    expect(page.getByText('Show Downloads')).toBeDefined();
    expect(page.getByText('Logs Download')).toBeDefined();
    logfileDtos.forEach(dto => {
      expect(page.getByText(dto.name)).toBeDefined();
    });

    fireEvent.click(page.getByText('Show Downloads'));
    fireEvent.click(page.getByText('Close'));
  });
})
