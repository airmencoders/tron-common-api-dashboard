import { AxiosResponse } from 'axios';
import Config from '../config';
import HttpClient from '../http-client';

class LogfileActuatorApi extends HttpClient {
  private static LOGFILE_ENDPOINT: string = Config.ACTUATOR_URL + 'logfile';

  public constructor() {
    super(LogfileActuatorApi.LOGFILE_ENDPOINT);
  }

  public getLogfile(): Promise<AxiosResponse<string>> {
    return this.instance.get<string>('', {
      headers: {
        'Range': 'bytes=-10240'
      }
    });
  }

  public getLogfileStart(start: number): Promise<AxiosResponse<string>> {
    return this.instance.get<string>('', {
      headers: {
        'Range': 'bytes=' + start + '-'
      }
    });
  }
}

export default LogfileActuatorApi;
