import UserInfoService from '../user-info-serivce';
import {createState} from '@hookstate/core';
import {UserInfoState} from '../user-info-state';
import {UserInfoControllerApi, UserInfoDto} from '../../../openapi';
import {AxiosResponse} from 'axios';

describe('User Info Service Tests', () => {

  let userInfoApi: UserInfoControllerApi;

  const mockAxiosUserInfo: AxiosResponse<UserInfoDto> = {
    config: {}, headers: undefined, status: 200, statusText: '',
    data: {
      dodId: 'id',
      givenName: 'givenName',
      familyName: 'familyName',
      name: 'name',
      preferredUsername: 'preferredUsername',
      email: 'email@email.com',
      organization: 'organization'
    }
  };

  beforeEach(() => {
    userInfoApi = new UserInfoControllerApi();

    userInfoApi.getUserInfo = jest.fn(() => {
      return new Promise<AxiosResponse<UserInfoDto>>( resolve => {
        resolve(mockAxiosUserInfo);
      })
    })
  })

  it('should be created', () => {
    const initState = createState<UserInfoState>({
      error: undefined,
      userInfo: undefined
    });
    const service = new UserInfoService(initState, userInfoApi);
    expect(service).toBeTruthy();
  })

  it('should provide the promised state', () => {
    const state = createState<UserInfoState>({
      error: undefined,
      userInfo: undefined
    });
    userInfoApi.getUserInfo = jest.fn(() => {
      return new Promise<AxiosResponse<UserInfoDto>>(resolve => {
        setTimeout(() =>
            resolve(mockAxiosUserInfo), 1000);
      })
    });
    const service = new UserInfoService(state, userInfoApi);
    service.fetchAndStoreUserInfo();
    expect(service.isPromised).toBeTruthy();
  });

  it ('should provide user info after returned from the service', async () => {
    const state = createState<UserInfoState>({
      error: undefined,
      userInfo: undefined
    });
    const service = new UserInfoService(state, userInfoApi);
    service.fetchAndStoreUserInfo();
    const flushPromises = () => new Promise(setImmediate);
    await flushPromises();

    expect(service.isPromised).toBeFalsy();
    expect(service.userInfo?.name).toEqual('name');
  });

  it ('should show have an error on the state if an error is returned from the service', async () => {
    const state = createState<UserInfoState>({
      error: undefined,
      userInfo: undefined
    });
    userInfoApi.getUserInfo = jest.fn( () => {
      return new Promise<AxiosResponse<UserInfoDto>>((resolve, reject) => {
        reject('Error');
      });
    });
    const service = new UserInfoService(state, userInfoApi);
    service.fetchAndStoreUserInfo();

    const flushPromises = () => new Promise(setImmediate);
    await flushPromises();

    expect(service.error).toEqual('Error');
  });
});
