import {createState, Downgraded, State, StateMethodsDestroy} from '@hookstate/core';
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
import PubSubService, {PubSubCollection} from '../pubsub-service';
import {wrapState} from '../pubsub-state';
import AppClientsService from "../../app-clients/app-clients-service";
import {accessAppClientsState} from "../../app-clients/app-clients-state";
import {AppClientFlat} from "../../app-clients/app-client-flat";
import {PrivilegeType} from '../../privilege/privilege-type';

jest.mock('../../app-clients/app-clients-state');

describe('Subscriber State Test', () => {
  let pubSubUserState: State<PubSubCollection[]> & StateMethodsDestroy;
  let appClientUserState: State<AppClientFlat[]> & StateMethodsDestroy;
  let subscriberDataState: State<SubscriberDto[]> & StateMethodsDestroy;
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

  beforeEach(async () => {
    pubSubUserState = createState<PubSubCollection[]>(new Array<PubSubCollection>());
    appClientUserState = createState<AppClientFlat[]>(new Array<AppClientFlat>());
    subscriberDataState = createState<SubscriberDto[]>(new Array<SubscriberDto>());
    pubSubApi = new SubscriberControllerApi();
    appClientApi = new AppClientControllerApi();

    let counter = 0;
    const privilegeDtos: PrivilegeDto[] = Object.values(PrivilegeType).map((item : any) => ({id: counter++, name: item }));
    privilegeState = createState<PrivilegeDto[]>(privilegeDtos);
    state = wrapState(pubSubUserState, pubSubApi, subscriberDataState);

    pubSubUserState.set(state.mapSubscriberDataToPubSubCollection(subscribers));
    subscriberDataState.set(subscribers);
  });

  afterEach(() => {
    pubSubUserState.destroy();
    subscriberDataState.destroy();
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

  it ('Has method to convert SubscriberDto to PubSubCollection', () => {
    const pubSubCollection = state.mapSubscriberDataToPubSubCollection(subscribers);
    expect(pubSubCollection).toHaveLength(subscribers.length);
    expect(pubSubCollection[0].appClientUser).toEqual(subscribers[0].appClientUser);
    expect(pubSubCollection[1].appClientUser).toEqual(subscribers[1].appClientUser);
    expect(pubSubCollection[0].events!.includes(SubscriberDtoSubscribedEventEnum.PersonChange)).toBeTruthy();
  });

  // test that the reconcileDifferences logic detects the create/update/delete operations
  //  on a PubSubCollection send from UI when compared to the SubscriberDto[] state collection
  it('Properly detects operations needed to send to API', async () => {

    state.sendSubscriptionDelete = jest.fn();
    state.sendSubscriptionCreate = jest.fn();
    state.sendSubscriptionUpdate = jest.fn();

    const subscriptionDtos: SubscriberDto[] = [
      {
        id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8",
        appClientUser: 'blue',
        subscribedEvent: SubscriberDtoSubscribedEventEnum.PersonChange,
        subscriberAddress: "/",
        secret: "1",
      },
      {
        id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd9",
        appClientUser: 'green',
        subscribedEvent: SubscriberDtoSubscribedEventEnum.PersonChange,
        subscriberAddress: "/api/event",
        secret: "2",
      }
    ];
    subscriberDataState.set(subscriptionDtos);
    pubSubUserState.set(state.mapSubscriberDataToPubSubCollection(subscriptionDtos));

    // add in one for PERSON_DELETE (like we checked the checkbox in the UI)
    let newSubscription = pubSubUserState.attach(Downgraded).get()[0];
    newSubscription.events!.push(SubscriberDtoSubscribedEventEnum.PersonDelete);
    await state.reconcileCollectionToSubscriberData(pubSubUserState.attach(Downgraded).get()[0]);

    // updates an existing sub and makes a new one for PERSON_DELETE
    expect(state.sendSubscriptionDelete).toBeCalledTimes(0);
    expect(state.sendSubscriptionCreate).toBeCalledTimes(1);
    expect(state.sendSubscriptionUpdate).toBeCalledTimes(1);
    (state.sendSubscriptionDelete as jest.Mock).mockClear();
    (state.sendSubscriptionCreate as jest.Mock).mockClear();
    (state.sendSubscriptionUpdate as jest.Mock).mockClear();


    // now delete the PERSON_DELETE and add sub for ORG_CHANGE and ORG_DELETE (1 delete, 2 creates, and 1 update)
    subscriptionDtos.push({
      id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8",
      appClientUser: 'blue',
      subscribedEvent: SubscriberDtoSubscribedEventEnum.PersonDelete,
      subscriberAddress: "/",
      secret: "1",
    });
    subscriberDataState.set(subscriptionDtos);
    pubSubUserState.set(state.mapSubscriberDataToPubSubCollection(subscriptionDtos));
    newSubscription = pubSubUserState.attach(Downgraded).get()[0];
    newSubscription.events! = [ SubscriberDtoSubscribedEventEnum.PersonChange,
      SubscriberDtoSubscribedEventEnum.OrganizationChange,
      SubscriberDtoSubscribedEventEnum.OrganizationDelete
    ];

    await state.reconcileCollectionToSubscriberData(pubSubUserState.attach(Downgraded).get()[0]);

    // updates an existing sub and makes a new one for PERSON_DELETE
    expect(state.sendSubscriptionDelete).toBeCalledTimes(1);
    expect(state.sendSubscriptionCreate).toBeCalledTimes(2);
    expect(state.sendSubscriptionUpdate).toBeCalledTimes(1);

    (state.sendSubscriptionDelete as jest.Mock).mockRestore();
    (state.sendSubscriptionCreate as jest.Mock).mockRestore();
    (state.sendSubscriptionUpdate as jest.Mock).mockRestore();
  });

  it('Properly updates service state on create/update/delete', async () => {
    const subscriptionDtos: SubscriberDto[] = [
      {
        id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8",
        appClientUser: 'blue',
        subscribedEvent: SubscriberDtoSubscribedEventEnum.PersonChange,
        subscriberAddress: "/",
        secret: "1",
      },
      {
        id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd9",
        appClientUser: 'green',
        subscribedEvent: SubscriberDtoSubscribedEventEnum.PersonChange,
        subscriberAddress: "/api/event",
        secret: "2",
      }
    ];

    pubSubApi.getAllSubscriptionsWrapped = jest.fn(() => {
      return new Promise<AxiosResponse<SubscriberDtoResponseWrapper>>(resolve => resolve({
        ...axiosGetResponse,
        data: { data: subscriptionDtos }
        }));
    });
    pubSubApi.cancelSubscription = jest.fn(() => {
      return new Promise<AxiosResponse<SubscriberDto>>(resolve => resolve(axiosDeleteResponse));
    });
    pubSubApi.createSubscription = jest.fn((dto: SubscriberDto) => {
      return new Promise<AxiosResponse<SubscriberDto>>(resolve => resolve({
        ...axiosPostPutResponse,
        data: {...dto, id: 'sfsdf'}
      }));
    });
    mockAppClientsState();

    await state.fetchAndStoreData().promise;  // mimic UI page initial load and pull

    expect(pubSubUserState.get()).toHaveLength(subscriptionDtos.length);
    expect(subscriberDataState.get()).toHaveLength(subscriptionDtos.length);
    expect(pubSubUserState.get()![0].events).toHaveLength(1);  // should have one PERSON_CHANGE EVENT

    // add PERSON_DELETE and ORG_CHANGE to the 'blue' app
    let blueAppCollection = pubSubUserState.attach(Downgraded).get()![0];  // get the app client's collection from state for modification
    blueAppCollection.events!.push(SubscriberDtoSubscribedEventEnum.PersonDelete, SubscriberDtoSubscribedEventEnum.OrganizationChange);  // mimic checking the boxes
    await state.sendUpdate(blueAppCollection);  // mimic update action
    expect(pubSubApi.createSubscription).toHaveBeenCalledTimes(3);
    expect(pubSubUserState.get()![0].events).toHaveLength(3);  // should now have PERSON_CHANGE/DELETE and ORG_CHANGE
    expect(subscriberDataState.get()).toHaveLength(4);

    (pubSubApi.createSubscription as jest.Mock).mockClear();

    // now remove just ORG_CHANGE from the 'blue' app
    blueAppCollection = pubSubUserState.attach(Downgraded).get()![0];  // get the app client's collection from state for modification
    blueAppCollection.events!.splice(blueAppCollection.events!.indexOf(SubscriberDtoSubscribedEventEnum.OrganizationChange), 1);  // mimic checking the boxes
    await state.sendUpdate(blueAppCollection);  // mimic update action
    expect(pubSubApi.createSubscription).toHaveBeenCalledTimes(2); // update (upsert) will be called twice
    expect(pubSubApi.cancelSubscription).toHaveBeenCalledTimes(1); // deleting the ORG_CHANGE
    expect(pubSubUserState.get()![0].events).toHaveLength(2);  // should now have PERSON_CHANGE and PERSON_DELETE
    expect(subscriberDataState.get()).toHaveLength(3);

    (pubSubApi.createSubscription as jest.Mock).mockClear();
    (pubSubApi.cancelSubscription as jest.Mock).mockClear();

    // now delete all of 'blue' subscriptions
    await state.sendDelete(pubSubUserState.get()[0]);
    expect(pubSubApi.cancelSubscription).toHaveBeenCalledTimes(2);  // delete all blue's subscriptions
    expect(pubSubUserState.get()).toHaveLength(1);
    expect(pubSubUserState.get()[0].appClientUser).toEqual('green');
  });

  it('Test fetch and store', async () => {
    pubSubApi.getAllSubscriptionsWrapped = jest.fn(() => {
      return new Promise<AxiosResponse<SubscriberDtoResponseWrapper>>(resolve => resolve(axiosGetResponse));
    });
    mockAppClientsState();
    
    const cancellableRequest = state.fetchAndStoreData();
    const data = await cancellableRequest.promise;
    expect(data).toHaveLength(subscribers.length);
  });

  it('Test sendUpdate Success', async () => {
    pubSubApi.createSubscription = jest.fn(() => {
      return new Promise<AxiosResponse<SubscriberDto>>(resolve => resolve(axiosPostPutResponse));
    });

    await expect(state.sendUpdate(pubSubUserState.get()[0])).resolves.toEqual(pubSubUserState.get()[0]);
  });

  it('Test sendUpdate Fail', async () => {
    pubSubApi.createSubscription = jest.fn(() => {
      return new Promise<AxiosResponse<SubscriberDto>>((resolve, reject) => reject(axiosRejectResponse));
    });

    await expect(state.sendUpdate(pubSubUserState.get()[0])).rejects.toBeTruthy();
  });

  it('Test sendUpdate Fail No ID', async () => {
    const noIdUser: SubscriberDto = { ...subscribers[0], id: undefined };

    subscriberDataState.set([noIdUser]);
    const noIdUserCollection = state.mapSubscriberDataToPubSubCollection([noIdUser]);

    expect.assertions(1);

    try {
      await state.sendUpdate(noIdUserCollection[0]);
    } catch (err) {
      expect(err).toBeDefined();
    }
  });

  it('Test sendCreate Success', async () => {
    pubSubApi.createSubscription = jest.fn(() => {
      return new Promise<AxiosResponse<SubscriberDto>>(resolve => resolve(axiosPostPutResponse));
    });

    await expect(state.sendCreate(pubSubUserState.get()[0])).resolves.toEqual(pubSubUserState.get()[0]);
  });

  it('Test sendCreate Fail', async () => {
    pubSubApi.createSubscription = jest.fn(() => {
      return new Promise<AxiosResponse<SubscriberDto>>((resolve, reject) => reject(axiosRejectResponse));
    });

    await expect(state.sendCreate(pubSubUserState.get()[0])).rejects.toBeTruthy();
  });

  it('Test sendDelete Success', async () => {
    pubSubApi.cancelSubscription = jest.fn(() => {
      return new Promise<AxiosResponse<SubscriberDto>>(resolve => resolve(axiosDeleteResponse));
    });

    await expect(state.sendDelete(pubSubUserState.get()[0])).resolves.not.toThrow();
  });

  it('Test sendDelete Fail', async () => {
    pubSubApi.cancelSubscription = jest.fn(() => {
      return new Promise<AxiosResponse<SubscriberDto>>((resolve, reject) => reject(axiosRejectResponse));
    });

    await expect(state.sendDelete(pubSubUserState.get()[0])).rejects.toBeTruthy();
  });

  it('Test sendDelete Fail - bad id', async () => {
    pubSubApi.cancelSubscription = jest.fn(() => {
      return new Promise<AxiosResponse<SubscriberDto>>(resolve => resolve(axiosDeleteResponse));
    });

    subscriberDataState.set([ {...subscribers[0], id: undefined}, subscribers[1]]);
    await expect(state.sendDelete({...pubSubUserState.get()[0]})).rejects.toBeDefined();
  });  
});