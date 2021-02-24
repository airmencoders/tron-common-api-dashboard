import { createState, State, useState } from '@hookstate/core';
import LogfileActuatorApi from '../../api/logfile/logfile-actuator-api';
import LogfileApi from '../../api/logfile/logfile-api';
import { LogfileDto } from '../../api/logfile/logfile-dto';
import CurrentLogfileService from './current-logfile-service';
import { CurrentLogfileState } from './current-logfile-state.ts';
import PastLogfileService from './past-logfile-service';

const logfileState = createState<CurrentLogfileState>({
  logs: new Array<string>(),
  maxLines: 5000,
  start: 0,
  end: 0,
  length: 0,
  refreshRate: 2000,
  loading: false,
  errors: undefined
});
const logfileActuatorApi: LogfileActuatorApi = new LogfileActuatorApi();

export const wrapCurrentLogfileState = (logfileState: State<CurrentLogfileState>, logfileActuatorApi: LogfileActuatorApi): CurrentLogfileService => {
  return new CurrentLogfileService(logfileState, logfileActuatorApi);
};

export const accessLogfileState = () => wrapCurrentLogfileState(logfileState, logfileActuatorApi);
export const useLogfileState = () => wrapCurrentLogfileState(useState(logfileState), logfileActuatorApi);


const pastLogfileState = createState<LogfileDto[]>(new Array<LogfileDto>());
const logfileApi: LogfileApi = new LogfileApi();

export const wrapPastLogfileState = (pastLogfileState: State<LogfileDto[]>, logfileApi: LogfileApi): PastLogfileService => {
  return new PastLogfileService(pastLogfileState, logfileApi);
};

export const accessPastLogfileState = () => wrapPastLogfileState(pastLogfileState, logfileApi);
export const usePastLogfileState = () => wrapPastLogfileState(useState(pastLogfileState), logfileApi);