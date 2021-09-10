import { Configuration, EventRequestLogControllerApi, EventRequestLogControllerApiInterface } from '../../openapi';
import Config from '../../api/config';
import EventRequestLogService from './event-request-log-service';

export const wrapState = (eventRequestLogApi: EventRequestLogControllerApiInterface): EventRequestLogService => {
  return new EventRequestLogService(eventRequestLogApi);
}

export const useEventRequestLogState = (): EventRequestLogService => wrapState(
  new EventRequestLogControllerApi(new Configuration({
    basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX
  })));
