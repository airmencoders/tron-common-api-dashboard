import { EventRequestLogControllerApi, EventRequestLogControllerApiInterface } from '../../openapi';
import EventRequestLogService from './event-request-log-service';
import { globalOpenapiConfig } from '../../api/openapi-config';

export const wrapState = (eventRequestLogApi: EventRequestLogControllerApiInterface): EventRequestLogService => {
  return new EventRequestLogService(eventRequestLogApi);
}

const api = new EventRequestLogControllerApi(
  globalOpenapiConfig.configuration,
  globalOpenapiConfig.basePath,
  globalOpenapiConfig.axios
);

export const useEventRequestLogState = (): EventRequestLogService => wrapState(api);
