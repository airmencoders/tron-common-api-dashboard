import {PersonDto, UserInfoDto} from '../../openapi/models';
import {State} from '@hookstate/core';
import {UserInfoControllerApiInterface} from '../../openapi';
import {UserInfoState} from './user-info-state';
import Config from '../../api/config';
import { prepareRequestError } from '../../utils/ErrorHandling/error-handling-utils';
import { CancellableAxiosDataRequest, isDataRequestCancelError, makeCancellableDataRequestToken } from '../../utils/cancellable-data-request';


export default class UserInfoService {
  constructor(private state: State<UserInfoState>,
              private userInfoApi: UserInfoControllerApiInterface) { }

  fetchAndStoreUserInfo(): CancellableAxiosDataRequest<UserInfoDto> {
    const requestOptions: any = {};
    // This supports local development and dev token
    if (Config.ACCESS_TOKEN != null) {
      requestOptions['headers'] = {
        'Authorization': `Bearer ${Config.ACCESS_TOKEN}`
      }
    }

    const wrappedCancellableRequest = makeCancellableDataRequestToken(this.userInfoApi.getUserInfo.bind(this.userInfoApi), requestOptions);
    const statePromise = wrappedCancellableRequest.axiosPromise()
      .then(response => {
        const userInfo = response.data;
        const result = {
          error: undefined,
          userInfo
        } as UserInfoState;

        return result;
      })
      .catch(error => {
        /**
         * Promise was cancelled.
         * Return default state value.
         */
        if (isDataRequestCancelError(error)) {
          return {};
        }

        return {
          error: prepareRequestError(error),
          userInfo: undefined
        } as UserInfoState;
      });

    this.state.set(statePromise);

    return wrappedCancellableRequest;
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

  getExistingPersonForUser(): CancellableAxiosDataRequest<PersonDto> {
    return makeCancellableDataRequestToken(this.userInfoApi.getExistingPersonRecord.bind(this.userInfoApi));
  }
}
