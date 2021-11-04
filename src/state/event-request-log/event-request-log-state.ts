import { Configuration, EventRequestLogControllerApi, EventRequestLogControllerApiInterface } from '../../openapi';
import Config from '../../api/config';
import EventRequestLogService from './event-request-log-service';
import { openapiAxiosInstance } from '../../api/openapi-axios';

export const wrapState = (eventRequestLogApi: EventRequestLogControllerApiInterface): EventRequestLogService => {
  return new EventRequestLogService(eventRequestLogApi);
}

const api = new EventRequestLogControllerApi(new Configuration({
  basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX
}), '', openapiAxiosInstance);

export const useEventRequestLogState = (): EventRequestLogService => wrapState(api);
