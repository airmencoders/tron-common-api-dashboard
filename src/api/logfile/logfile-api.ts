import { AxiosResponse } from 'axios';
import Config from '../config';
import HttpClient from '../http-client';
import { LogfileDto } from './logfile-dto';

class LogfileApi extends HttpClient {
  private static LOGFILE_ENDPOINT: string = Config.API_BASE_URL + Config.API_PATH_PREFIX + '/' + Config.API_VERSION_PREFIX + '/logfile';

  public constructor() {
    super(LogfileApi.LOGFILE_ENDPOINT);
  }

  public getLogfiles(): Promise<AxiosResponse<LogfileDto[]>> {
    return this.instance.get<LogfileDto[]>('');
  }
}

export default LogfileApi;
