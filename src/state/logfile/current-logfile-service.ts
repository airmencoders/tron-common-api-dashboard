import { State } from '@hookstate/core';
import { AxiosPromise, AxiosResponse } from 'axios';
import LogfileActuatorApi from '../../api/logfile/logfile-actuator-api';
import { CurrentLogfileState } from './current-logfile-state.ts';

export default class CurrentLogfileService {
  constructor(private logfileState: State<CurrentLogfileState>, private logfileActuatorApi: LogfileActuatorApi) { }

  async fetchAndStoreCurrentLogfile() {
    this.logfileState.loading.set(true);

    const currentLogFile = (): AxiosPromise<string> => this.getCurrentLogfile();
    let results: AxiosResponse<string> | undefined = undefined;

    try {
      results = await currentLogFile();
    } catch (err) {
      // This error will occur if current logfile gets archived and a new one is created
      // Just reset state to start reading from the tail of the new logfile
      if (err.response && err.response.status === 416) {
        this.logfileState.start.set(0);
        this.logfileState.end.set(0);
        this.logfileState.length.set(0);
      } else {
        this.logfileState.errors.set(err.message);
      }
    }

    if (results) {
      const range = this.parseContentRangeHeader(results.headers['content-range']);
      const messages: string[] = Array.from(results.data.match(/.+/g) || []);

      let combinedMessages = this.getCurrentLog.concat(messages);
      if (combinedMessages.length > this.logfileState.maxLines.get()) {
        combinedMessages = combinedMessages.slice(combinedMessages.length - this.logfileState.maxLines.get());
      }

      this.logfileState.set(prev => {
        return {
          ...prev,
          logs: combinedMessages,
          ...range,
        }
      });
    }

    this.logfileState.loading.set(false);
  }

  clearState() {
    this.logfileState.set(prev => {
      return {
        logs: new Array<string>(),
        maxLines: prev.maxLines,
        start: 0,
        end: 0,
        length: 0,
        refreshRate: prev.refreshRate,
        loading: false,
        errors: undefined
      }
    })
  }

  protected getCurrentLogfile(): Promise<AxiosResponse<string>> {
    if (this.logfileState.length.get() === 0)
      return this.logfileActuatorApi.getLogfile();
    else
      return this.logfileActuatorApi.getLogfileStart(this.logfileState.end.value);
  }

  protected parseContentRangeHeader(range: string): any {
    if (range.includes('*')) {
      const split = range.split('/');

      if (split.length !== 2) {
        throw new Error('Could not parse Content-Range header');
      }

      return {
        start: split[1],
        end: split[1],
        length: split[1]
      };
    } else {
      const split = Array.from(range.match(/([0-9])+/g) || []);

      if (split.length !== 3) {
        throw new Error('Could not parse Content-Range header');
      }

      return {
        start: split[0],
        end: split[1],
        length: split[2]
      }
    }
  }

  get isLoading(): boolean {
    return this.logfileState.loading.get();
  }

  get getCurrentLog(): Array<string> {
    return this.logfileState.logs.get();
  }

  get getRefreshRate(): number {
    return this.logfileState.refreshRate.get();
  }

  get error(): string | undefined {
    return this.logfileState.errors.get();
  }
}