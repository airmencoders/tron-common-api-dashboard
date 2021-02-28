import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LogfilePage from '../LogfilePage';
import { useLogfileState, usePastLogfileState } from '../../../state/logfile/logfile-state';
import CurrentLogfileService from '../../../state/logfile/current-logfile-service';
import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { CurrentLogfileState } from '../../../state/logfile/current-logfile-state';
import LogfileActuatorApi from '../../../api/logfile/logfile-actuator-api';
import { LogfileDto } from '../../../api/logfile/logfile-dto';
import LogfileApi from '../../../api/logfile/logfile-api';
import PastLogfileService from '../../../state/logfile/past-logfile-service';

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

    expect(page.getByText('Loading...')).toBeDefined();
  });
})
