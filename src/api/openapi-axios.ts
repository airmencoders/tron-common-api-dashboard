import axios, { AxiosResponse } from 'axios';
import { accessUserInfoState } from '../state/user/user-info-state';

/**
 * Used to feed into openapi generated controllers so that we can specify the
 * axios instance it uses to add an interceptor to it.
 */
export const openapiAxiosInstance = axios.create();
export function axiosAuthSuccessResponseInterceptor(response: AxiosResponse<any>) {
  return response;
}
export function axiosAuthErrorResponseInterceptor(error: any) {
  if (error.request && process.env.NODE_ENV === 'production') {
    const userInfoService = accessUserInfoState();
    const authExpireTime = userInfoService.userInfo?.expireTime;
    if (authExpireTime && authExpireTime * 1000 < Date.now()) {
      window.location.reload();
    }
  } else {
    return Promise.reject(error);
  }
}

/**
 * Interceptor to handle the case in which the authenticated User's
 * JWT has expired.
 * 
 * When the User is no longer authenticated, requests to the server
 * will be redirected to external login. This ends up failing due to
 * CORS and will result in axios throwing an error on the request.
 */
openapiAxiosInstance.interceptors.response.use(axiosAuthSuccessResponseInterceptor, axiosAuthErrorResponseInterceptor);