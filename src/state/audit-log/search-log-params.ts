import format from 'date-fns/format';

export type SearchLogParams = {
  date: string,
  requestMethod: string,
  requestedUrlContains: string,
  statusCode: string,
  remoteIpContains: string,
  hostContains: string,
  userAgentContains: string,
  queryStringContains: string,
  userNameContains: string,
}

export function getDefaultSearchLogParams(): SearchLogParams {
  return {
    date: format(new Date(), 'yyyy-MM-dd'),
    requestMethod: '',
    requestedUrlContains: '',
    statusCode: '',
    remoteIpContains: '',
    hostContains: '',
    userAgentContains: '',
    queryStringContains: '',
    userNameContains: '',
  } as SearchLogParams;
}