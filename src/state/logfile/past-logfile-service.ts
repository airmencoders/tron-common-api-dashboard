import { State } from '@hookstate/core';
import { AxiosPromise } from 'axios';
import LogfileApi from '../../api/logfile/logfile-api';
import { LogfileDto } from '../../api/logfile/logfile-dto';

export default class PastLogfileService {
  constructor(private pastLogfileState: State<LogfileDto[]>, private logfileApi: LogfileApi) { }

  fetchAndStorePastLogfiles(): Promise<LogfileDto[]> {
    const allLogfiles = (): AxiosPromise<LogfileDto[]> => this.logfileApi.getLogfiles();
    const pastLogRequest = Promise.resolve(allLogfiles().then(r => r.data));

    this.pastLogfileState.set(pastLogRequest);

    return pastLogRequest;
  }

  get isPromised(): boolean {
    return this.pastLogfileState.promised;
  }

  get getPastLogs(): LogfileDto[] {
    return this.pastLogfileState.promised ? [] : this.pastLogfileState.get();
  }

  get error(): string | undefined {
    return this.pastLogfileState.promised ? undefined : this.pastLogfileState.error;
  }
}