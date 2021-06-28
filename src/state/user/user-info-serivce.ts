import {PersonDto, UserInfoDto} from '../../openapi/models';
import {State} from '@hookstate/core';
import {UserInfoControllerApiInterface} from '../../openapi';
import {UserInfoState} from './user-info-state';
import Config from '../../api/configuration';

export default class UserInfoService {

  constructor(private state: State<UserInfoState>,
              private userInfoApi: UserInfoControllerApiInterface) { }

  fetchAndStoreUserInfo() {
    const requestOptions: any = {};
    // This supports local development and dev token
    if (Config.ACCESS_TOKEN != null) {
      requestOptions['headers'] = {
        'Authorization': `Bearer ${Config.ACCESS_TOKEN}`
      }
    }
    this.state.set(this.userInfoApi.getUserInfo(requestOptions)
        .then(response => {
          const userInfo = response.data;
          return {
            error: undefined,
            userInfo
          } as UserInfoState
        })
        .catch(error => {
          return {
            error,
            userInfo: undefined
          } as UserInfoState
        }));
  }

  get isPromised(): boolean {
    return this.state.promised;
  }

  get userInfo(): UserInfoDto | undefined {
    return this.state.promised ? undefined : this.state.get()?.userInfo;
  }

  get error(): any | undefined {
    return this.state.promised ? undefined : this.state.get()?.error;
  }

  async getExistingPersonForUser(): Promise<PersonDto> {
    try {
      const personResponse = await this.userInfoApi.getExistingPersonRecord();
      return personResponse.data;
    } catch (err) {
      return Promise.reject(err);
    }
  }
}
