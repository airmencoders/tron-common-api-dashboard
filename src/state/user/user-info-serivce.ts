import {PersonDto, UserInfoDto} from '../../openapi/models';
import {State} from '@hookstate/core';
import {UserInfoControllerApiInterface} from '../../openapi';
import {UserInfoState} from './user-info-state';
import Config from '../../api/config';
import { prepareRequestError } from '../../utils/ErrorHandling/error-handling-utils';
import { CancellablePromise } from '../../utils/cancellable-promise';

export default class UserInfoService {

  constructor(private state: State<UserInfoState>,
              private userInfoApi: UserInfoControllerApiInterface) { }

  fetchAndStoreUserInfo(): CancellablePromise<UserInfoState> {
    const requestOptions: any = {};
    // This supports local development and dev token
    if (Config.ACCESS_TOKEN != null) {
      requestOptions['headers'] = {
        'Authorization': `Bearer ${Config.ACCESS_TOKEN}`
      }
    }

    const cancellablePromise = new CancellablePromise(this.userInfoApi.getUserInfo(requestOptions)
      .then(response => {
        const userInfo = response.data;
        const result = {
          error: undefined,
          userInfo
        } as UserInfoState;

        return result;
      })
    );

    cancellablePromise
      .promise
      .then(response => {
        this.state.set(response);
      })
      .catch(({ isCanceled, ...error }) => {
        // The promise was canceled... don't set the state
        if (isCanceled == true) {
          return;
        }

        const result = {
          error: prepareRequestError(error),
          userInfo: undefined
        } as UserInfoState;

        this.state.set(result);
      });

    return cancellablePromise;
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
