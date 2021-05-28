import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { AxiosResponse } from 'axios';
import { Configuration, SubscriberControllerApi, SubscriberControllerApiInterface, SubscriberDto, SubscriberDtoResponseWrapper, SubscriberDtoSubscribedEventEnum} from '../../../openapi';
import { accessPrivilegeState } from '../../privilege/privilege-state';
import Config from '../../../api/configuration';
import PubSubService from '../pubsub-service';
import { wrapState } from '../pubsub-state';
import { _ } from 'ag-grid-community';
import { DataCrudFormErrors } from '../../../components/DataCrudFormPage/data-crud-form-errors';

describe('Subscriber State Test', () => {
  let pubSubUserState: State<SubscriberDto[]> & StateMethodsDestroy;
  let pubSubApi: SubscriberControllerApiInterface;
  let state: PubSubService;

  const subscribers: SubscriberDto[] = [
    {
        id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8",
        subscribedEvent: SubscriberDtoSubscribedEventEnum.PersonChange,
        subscriberAddress: "http://app.app.svc.cluster.local/",
        secret: "",
    },
    {
        id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd9",
        subscribedEvent: SubscriberDtoSubscribedEventEnum.PersonChange,
        subscriberAddress: "http://app2.app2.svc.cluster.local/",
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
    pubSubApi = new SubscriberControllerApi();
    state = wrapState(pubSubUserState, pubSubApi);
  });

  afterEach(() => {
    pubSubUserState.destroy();
  })

  it('Test fetch and store', async () => {
    pubSubApi.getAllSubscriptionsWrapped = jest.fn(() => {
      return new Promise<AxiosResponse<SubscriberDtoResponseWrapper>>(resolve => resolve(axiosGetResponse));
    });

    const fetch = await state.fetchAndStoreData();
    expect(fetch).toEqual(subscribers);
   
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