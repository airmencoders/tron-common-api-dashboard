import { createState, State, useState } from '@hookstate/core';
import LogfileActuatorApi from '../../api/logfile/logfile-actuator-api';
import LogfileApi from '../../api/logfile/logfile-api';
import { LogfileDto } from '../../api/logfile/logfile-dto';
import CurrentLogfileService from './current-logfile-service';
import { CurrentLogfileState } from './current-logfile-state';
import PastLogfileService from './past-logfile-service';

const logfileGlobalState = createState<CurrentLogfileState>({
  logs: new Array<string>(),
  maxLines: 5000,
  start: 0,
  end: 0,
  length: 0,
  refreshRate: 2000,
  loading: false,
  errors: undefined
});
const logfileActuatorControllerApi: LogfileActuatorApi = new LogfileActuatorApi();

export const wrapCurrentLogfileState = (logfileState: State<CurrentLogfileState>, logfileActuatorApi: LogfileActuatorApi): CurrentLogfileService => {
  return new CurrentLogfileService(logfileState, logfileActuatorApi);
};

export const accessLogfileState = () => wrapCurrentLogfileState(logfileGlobalState, logfileActuatorControllerApi);
export const useLogfileState = () => wrapCurrentLogfileState(useState(logfileGlobalState), logfileActuatorControllerApi);


const pastLogfileGlobalState = createState<LogfileDto[]>(new Array<LogfileDto>());
const logfileControllerApi: LogfileApi = new LogfileApi();

export const wrapPastLogfileState = (pastLogfileState: State<LogfileDto[]>, logfileApi: LogfileApi): PastLogfileService => {
  return new PastLogfileService(pastLogfileState, logfileApi);
};

export const accessPastLogfileState = () => wrapPastLogfileState(pastLogfileGlobalState, logfileControllerApi);
export const usePastLogfileState = () => wrapPastLogfileState(useState(pastLogfileGlobalState), logfileControllerApi);