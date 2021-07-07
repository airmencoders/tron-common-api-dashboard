import {createState, State, StateMethodsDestroy} from '@hookstate/core';
import {AxiosResponse} from 'axios';
import {
  AppClientControllerApi,
  AppClientControllerApiInterface,
  AppClientUserDtoResponseWrapped,
  PrivilegeDto,
  SubscriberControllerApi,
  SubscriberControllerApiInterface,
  SubscriberDto,
  SubscriberDtoResponseWrapper,
  SubscriberDtoSubscribedEventEnum
} from '../../../openapi';
import PubSubService from '../pubsub-service';
import {wrapState} from '../pubsub-state';
import {DataCrudFormErrors} from '../../../components/DataCrudFormPage/data-crud-form-errors';
import AppClientsService from "../../app-clients/app-clients-service";
import {accessAppClientsState} from "../../app-clients/app-clients-state";
import {AppClientFlat} from "../../app-clients/app-client-flat";
import { PrivilegeType } from '../../privilege/privilege-type';

jest.mock('../../app-clients/app-clients-state');

describe('Subscriber State Test', () => {
  let pubSubUserState: State<SubscriberDto[]> & StateMethodsDestroy;
  let appClientUserState: State<AppClientFlat[]> & StateMethodsDestroy;
  let privilegeState: State<PrivilegeDto[]> & StateMethodsDestroy;
  let pubSubApi: SubscriberControllerApiInterface;
  let appClientApi: AppClientControllerApiInterface;
  let state: PubSubService;

  const subscribers: SubscriberDto[] = [
    {
        id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8",
        appClientUser: 'apache',
        subscribedEvent: SubscriberDtoSubscribedEventEnum.PersonChange,
        subscriberAddress: "/",
        secret: "",
    },
    {
        id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd9",
        appClientUser: 'blackhawk',
        subscribedEvent: SubscriberDtoSubscribedEventEnum.PersonChange,
        subscriberAddress: "/",
        secret: "",
    }
  ];
  
  const axiosGetResponse: AxiosResponse = {
    data: { data: subscribers },
    status: 200,
    statusText: 'OK',
    config: {},
    headers: {}
  };

  const axiosAppClientGetResponse: AxiosResponse = {
    data: { data: [] },
    status: 200,
    statusText: 'OK',
    config: {},
    headers: {}
  };

  const axiosPostPutResponse = {
    data: subscribers[0],
    status: 200,
    statusText: 'OK',
    config: {},
    headers: {}
  };

  const axiosDeleteResponse = {
    data: subscribers[0],
    status: 204,
    statusText: 'OK',
    config: {},
    headers: {}
  };

  const axiosRejectResponse = {
    response: {
      data: {
        message: 'failed'
      },
      status: 400,
      statusText: 'OK',
      config: {},
      headers: {}
    }
  };

  const rejectMsg = {
    general: axiosRejectResponse.response.data.message
  } as DataCrudFormErrors;

  beforeEach(async () => {
    pubSubUserState = createState<SubscriberDto[]>(new Array<SubscriberDto>());
    appClientUserState = createState<AppClientFlat[]>(new Array<AppClientFlat>());
    pubSubApi = new SubscriberControllerApi();
    appClientApi = new AppClientControllerApi();

    let counter = 0;
    const privilegeDtos: PrivilegeDto[] = Object.values(PrivilegeType).map((item : any) => ({id: counter++, name: item }));
    privilegeState = createState<PrivilegeDto[]>(privilegeDtos);
    state = wrapState(pubSubUserState, pubSubApi);
  });

  afterEach(() => {
    pubSubUserState.destroy();
  });

  function mockAppClientsState() {
    (accessAppClientsState as jest.Mock).mockReturnValue(new AppClientsService(appClientUserState, appClientApi, privilegeState));
    appClientApi.getAppClientUsersWrapped = jest.fn(() => {
      return new Promise<AxiosResponse<AppClientUserDtoResponseWrapped>>(resolve => resolve({
        data: { data: [] },
        status: 200,
        headers: {},
        config: {},
        statusText: 'OK'
      }));
    });
  }

  it('Test fetch and store', async () => {
    pubSubApi.getAllSubscriptionsWrapped = jest.fn(() => {
      return new Promise<AxiosResponse<SubscriberDtoResponseWrapper>>(resolve => resolve(axiosGetResponse));
    });
    mockAppClientsState();
    
    const cancellableRequest = state.fetchAndStoreData();
    const data = await cancellableRequest.promise;

    expect(data).toEqual(subscribers);
  });

  it('Test sendUpdate Success', async () => {
    pubSubApi.createSubscription = jest.fn(() => {
      return new Promise<AxiosResponse<SubscriberDto>>(resolve => resolve(axiosPostPutResponse));
    });

    pubSubUserState.set([subscribers[0]])

    await expect(state.sendUpdate(subscribers[0])).resolves.toEqual(subscribers[0]);
    expect(pubSubUserState.get()).toEqual([subscribers[0]]);
  });

  it('Test sendUpdate Fail', async () => {
    pubSubApi.createSubscription = jest.fn(() => {
      return new Promise<AxiosResponse<SubscriberDto>>((resolve, reject) => reject(axiosRejectResponse));
    });

    await expect(state.sendUpdate(subscribers[0])).rejects.toBeTruthy();
  });

  it('Test sendUpdate Fail No ID', async () => {
    const noIdUser: SubscriberDto = {
      ...subscribers[0],
      id: undefined
    };

    expect.assertions(1);

    try {
      await state.sendUpdate(noIdUser);
    } catch (err) {
      expect(err).toBeDefined();
    }
  });

  it('Test sendCreate Success', async () => {
    pubSubApi.createSubscription = jest.fn(() => {
      return new Promise<AxiosResponse<SubscriberDto>>(resolve => resolve(axiosPostPutResponse));
    });

    await expect(state.sendCreate(subscribers[0])).resolves.toEqual(subscribers[0]);
  });

  it('Test sendCreate Fail', async () => {
    pubSubApi.createSubscription = jest.fn(() => {
      return new Promise<AxiosResponse<SubscriberDto>>((resolve, reject) => reject(axiosRejectResponse));
    });

    await expect(state.sendCreate(subscribers[0])).rejects.toBeTruthy();
  });

  it('Test sendDelete Success', async () => {
    pubSubApi.cancelSubscription = jest.fn(() => {
      return new Promise<AxiosResponse<SubscriberDto>>(resolve => resolve(axiosDeleteResponse));
    });

    await expect(state.sendDelete(subscribers[0])).resolves.not.toThrow();
  });

  it('Test sendDelete Fail', async () => {
    pubSubApi.cancelSubscription = jest.fn(() => {
      return new Promise<AxiosResponse<SubscriberDto>>((resolve, reject) => reject(axiosRejectResponse));
    });

    await expect(state.sendDelete(subscribers[0])).rejects.toBeTruthy();
  });

  it('Test sendDelete Fail - bad id', async () => {
    pubSubApi.cancelSubscription = jest.fn(() => {
      return new Promise<AxiosResponse<SubscriberDto>>(resolve => resolve(axiosDeleteResponse));
    });

    await expect(state.sendDelete({ ...subscribers[0], id: undefined })).rejects.toBeDefined();
  });  
});