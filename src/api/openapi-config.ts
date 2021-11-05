import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Configuration } from '../openapi';
import { accessUserInfoState } from '../state/user/user-info-state';
import Config from './config';

interface OpenapiParameters {
  configuration: Configuration;
  basePath: string;
  axios: AxiosInstance | undefined;
}

export function axiosAuthSuccessResponseInterceptor(response: AxiosResponse<any>) {
  return response;
}

/**
 * Interceptor to handle the case in which the authenticated User's
 * JWT has expired.
 * 
 * When the User is no longer authenticated, requests to the server
 * will be redirected to external login. This ends up failing due to
 * CORS. To try to combat against this, check to make sure the api
 * server did not give back a valid error response (error.response)
 * and that the error.request exists.
 */
export function axiosAuthErrorResponseInterceptor(error: any) {
  if (error.response == null && error.request && process.env.NODE_ENV === 'production') {
    const userInfoService = accessUserInfoState();
    const authExpireTime = userInfoService.userInfo?.expireTime;
    if (authExpireTime && authExpireTime * 1000 < Date.now()) {
      window.location.reload();
    }
  }

  return Promise.reject(error);
}

const axiosInstance = axios.create();
axiosInstance.interceptors.response.use(axiosAuthSuccessResponseInterceptor, axiosAuthErrorResponseInterceptor);

export const globalOpenapiConfig: OpenapiParameters = {
  configuration: new Configuration({ basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX }),
  basePath: '',
  axios: axiosInstance
};
