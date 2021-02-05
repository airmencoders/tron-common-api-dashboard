import {UserInfoDto} from '../../openapi/models';
import {State} from '@hookstate/core';
import {UserInfoControllerApiInterface} from '../../openapi';
import {UserInfoState} from './user-info-state';
import Config from '../../api/configuration';

export default class UserInfoService {

  constructor(private state: State<UserInfoState>,
              private userInfoApi: UserInfoControllerApiInterface) { }

  async fetchAndStoreUserInfo() {
    try {
      const requestOptions: any = {};
      if (Config.ACCESS_TOKEN != null) {
        requestOptions['headers'] = {
          'Authorization': `Bearer ${Config.ACCESS_TOKEN}`
        }
      }
      const userInfoResult = await this.userInfoApi.getUserInfo(requestOptions);
      const userInfo = userInfoResult.data;
      this.state.set({
        error: undefined,
        userInfo
      } as UserInfoState)
    }
    catch (error) {
      this.state.set({
        error,
        userInfo: undefined
      } as UserInfoState)
    }
  }

  get isPromised(): boolean {
    return this.state.promised;
  }

  get userInfo(): UserInfoDto | undefined {
    return this.state.promised ? undefined : this.state.get()?.userInfo;
  }
}
