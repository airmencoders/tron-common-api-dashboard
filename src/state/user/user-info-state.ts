import {createState, State, useState} from '@hookstate/core';
import {UserInfoDto} from '../../openapi/models';
import { UserInfoControllerApi, UserInfoControllerApiInterface } from '../../openapi';
import UserInfoService from './user-info-serivce';
import { globalOpenapiConfig } from '../../api/openapi-config';

export interface UserInfoState {
  error?: any,
  userInfo?: UserInfoDto
}

const userInfoState = createState<UserInfoState>({
  error: undefined,
  userInfo: undefined
});

const api = new UserInfoControllerApi(
  globalOpenapiConfig.configuration,
  globalOpenapiConfig.basePath,
  globalOpenapiConfig.axios
);

export const wrapState = (state: State<UserInfoState>, userInfoApi: UserInfoControllerApiInterface): UserInfoService => {
  return new UserInfoService(state, userInfoApi);
}

export const useUserInfoState = (): UserInfoService => wrapState(useState(userInfoState), api);
export const accessUserInfoState = () => wrapState(userInfoState, api);