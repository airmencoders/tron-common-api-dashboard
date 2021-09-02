import {Downgraded, none, State} from '@hookstate/core';
import {SubscriberControllerApiInterface, SubscriberDtoSubscribedEventEnum} from '../../openapi';
import {SubscriberDto} from '../../openapi/models/subscriber-dto';
import {
  CancellableDataRequest,
  isDataRequestCancelError,
  makeCancellableDataRequest
} from '../../utils/cancellable-data-request';
import {accessAppClientsState} from '../app-clients/app-clients-state';
import {DataService} from '../data-service/data-service';
import {prepareDataCrudErrorResponse, wrapDataCrudWrappedRequest} from '../data-service/data-service-utils';

// an object representing a single app client's subscriptions
//  built from individual SubscriberDtos
export interface PubSubCollection {
  id?: number | string;
  appClientUser: string;
  subscriberAddress: string,
  events?: SubscriberDtoSubscribedEventEnum[];
  secret: string;

  // these optional flags are for the UI display convenience
  personChange?: boolean;
  personDelete?: boolean;
  organizationChange?: boolean;
  organizationDelete?: boolean;
  personOrgAdd?: boolean;
  personOrgRemove?: boolean;
  subOrgAdd?: boolean;
  subOrgRemove?: boolean;
}

export default class PubSubService implements DataService<PubSubCollection, PubSubCollection> {

  constructor(
    public state: State<PubSubCollection[]>, 
    private pubSubApi: SubscriberControllerApiInterface,
    public subscriberData: State<SubscriberDto[]>) {
  }

  fetchAndStoreData(): CancellableDataRequest<PubSubCollection[]> {
    const appClientsRequest = accessAppClientsState().fetchAndStoreData();

    const cancellableRequest = makeCancellableDataRequest(appClientsRequest.cancelTokenSource, this.pubSubApi.getAllSubscriptionsWrapped.bind(this.pubSubApi));
    const requestPromise = wrapDataCrudWrappedRequest(cancellableRequest.axiosPromise());

    const data = new Promise<PubSubCollection[]>(async (resolve, reject) => {
      try {
        await appClientsRequest.promise;
        const result = await requestPromise;
        this.subscriberData.set(result);  // store the raw Subscription DTOs, in service state
        resolve(this.mapSubscriberDataToPubSubCollection(result)); // map the DTOs into a reduced, PubSubCollection array
      } catch (error) {
        if (isDataRequestCancelError(error)) {
          return [];
        }
        reject(prepareDataCrudErrorResponse(error));
      }
    });

    this.state.set(data);

    return {
      promise: data,
      cancelTokenSource: cancellableRequest.cancelTokenSource
    };
  }

  convertRowDataToEditableData(rowData: PubSubCollection): Promise<PubSubCollection> {
    return Promise.resolve(rowData);
  }

  async reconcileCollectionToSubscriberData(collection: PubSubCollection): Promise<PubSubCollection> {
    enum OperationType {
      UPDATE,
      CREATE,
      DELETE
    }

    interface Operation {
      op : OperationType,
      dto: SubscriberDto,
    }

    // this list of API operations we'll perform at the end
    const operationsToPerform = new Array<Operation>();

    // get the raw list of subscription DTOs stored from API for this app client
    const subscriptions : (SubscriberDto | undefined)[] = ([...this.subscriberData
        .attach(Downgraded)
        .get()
        .filter(item => item.appClientUser === collection.appClientUser)]);

    // first we need to apply the subscription address and secret to all events
    subscriptions.forEach(item => {
      if (item) {
        item.subscriberAddress = collection.subscriberAddress;
        item.secret = collection.secret;
      }
    });

    // copy of the original subscription events, we'll remove elements
    //  from here and see what's left over to tell what subscription events to delete (if anything)
    const originalSubscriberEvents = [...subscriptions];

    // go thru the collection sent from the UI, and see what differences we have made
    //  in terms of events chosen (checked or unchecked)
    for (const event of (collection.events ?? [])) {
      let foundMatch = false;
      for (let i=0; i<subscriptions.length; i++) {
        // if event's match - its still there, so send an update to ensure sub address and secret are in-sync
        if (subscriptions[i] && subscriptions[i]!.subscribedEvent === event) {
          operationsToPerform.push({ op: OperationType.UPDATE, dto: subscriptions[i]! });
          foundMatch = true;
          // mark this original subscription element as "accounted for", its not a deletion
          originalSubscriberEvents[i] = undefined;
          break;
        }
      }

      if (!foundMatch) {
        // new event subscription detected
        operationsToPerform.push({op: OperationType.CREATE, dto: {
          appClientUser: collection.appClientUser,
          secret: collection.secret,
          subscribedEvent: event,
          subscriberAddress: collection.subscriberAddress }
        });
      }

    }

    // see what to delete now (whats left over in the original subscriber events list
    originalSubscriberEvents.forEach(item => {
      if (item) {
        operationsToPerform.push({
          op: OperationType.DELETE,
          dto: item
        });
      }
    });

    // now do the operations
    try {
      for (const item of operationsToPerform) {
        switch (item.op) {
          case OperationType.DELETE:
            await this.sendSubscriptionDelete(item.dto);
            break;
          case OperationType.CREATE:
            await this.sendSubscriptionCreate(item.dto);
            break;
          case OperationType.UPDATE:
            await this.sendSubscriptionUpdate(item.dto);
            break;
          default:
            break;
        }
      }
    }
    catch (e) {
      return Promise.reject(e);
    }

    return Promise.resolve(collection);
  }

  // Called from the Pub Sub editor form
  async sendUpdate(toUpdate: PubSubCollection): Promise<PubSubCollection> {
    return await this.reconcileCollectionToSubscriberData(toUpdate);
  }

  // Called from the Pub Sub editor form - for a brand new subscriber
  async sendCreate(toCreate: PubSubCollection): Promise<PubSubCollection> {
    return await this.reconcileCollectionToSubscriberData(toCreate);
  }

  // Called from the pub-sub main page itself, not the editor form, so deletes all subscriptions for an app client
  async sendDelete(toDelete: PubSubCollection): Promise<void> {
    const itemsToDelete = [...this.subscriberData.get().filter(item => item.appClientUser === toDelete.appClientUser)];
    for (const subscription of itemsToDelete) {
      await this.sendSubscriptionDelete(subscription);
    }
    return Promise.resolve();
  }

  // Create a new subscription for an event and given subscriber
  async sendSubscriptionCreate(toCreate: SubscriberDto): Promise<SubscriberDto> {
    try {
      const subscriberResponse = await this.pubSubApi.createSubscription(toCreate);
      const subscriberDto = subscriberResponse.data as SubscriberDto;
      const currentIndex = this.subscriberData.get().findIndex(sub =>
          (sub.id === subscriberResponse.data.id && sub.subscribedEvent === subscriberResponse.data.subscribedEvent));

      if (currentIndex !== -1) this.subscriberData[currentIndex].set(subscriberResponse.data);
      else this.subscriberData[this.subscriberData.length].set(subscriberDto);
      this.state.set(this.mapSubscriberDataToPubSubCollection(this.subscriberData.get()));
      return Promise.resolve(subscriberDto);
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  // Updates a subscription for an event and given subscriber
  async sendSubscriptionUpdate(toUpdate: SubscriberDto): Promise<SubscriberDto> {
    try {
      if (!toUpdate.id) {
        return Promise.reject(new Error('Subscriber to update has undefined id.'));
      }

      const updatedResponse = await this.pubSubApi.createSubscription(toUpdate as SubscriberDto);
      const updatedData = updatedResponse.data;
      this.subscriberData.find(item => item.id.get() === updatedData.id)?.set(updatedData);
      this.state.set(this.mapSubscriberDataToPubSubCollection(this.subscriberData.get()));
      return Promise.resolve(updatedData);
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  // Deletes (or removes) a subscribed event from a given app client subscriber
  async sendSubscriptionDelete(toDelete: SubscriberDto): Promise<void> {
    try {
      if (toDelete?.id == null) {
        return Promise.reject('Subscription to delete has undefined id.');
      }

      await this.pubSubApi.cancelSubscription(toDelete.id);
      this.subscriberData.find(item => item.id.get() === toDelete.id)?.set(none);
      this.state.set(this.mapSubscriberDataToPubSubCollection(this.subscriberData.get()));
      return Promise.resolve();
    } catch (error) {

      return Promise.reject(error);
    }
  }

  get isPromised(): boolean {
    return this.state.promised;
  }

  get error(): string | undefined {
    return this.state.promised ? undefined : this.state.error;
  }

  resetState() {
    if (!this.state.promised) {
      this.state.set([]);
    }
  }

  // Helper to map the subscription DTOs into a reduced (by app client) PubSubCollection array
  //  this is what the Pub Sub UI components will deal with
  mapSubscriberDataToPubSubCollection(data: SubscriberDto[]): PubSubCollection[] {
    let count = 1;
    const subscribers = new Map<string, PubSubCollection>();
    for (const item of data) {
      if (!subscribers.has(item.appClientUser)) {
        subscribers.set(item.appClientUser, {
          id: count++,
          appClientUser: item.appClientUser,
          subscriberAddress: item.subscriberAddress ?? '',
          events: [ item.subscribedEvent ],
          secret: '',
        })
      }
      else {
        const existingItem = subscribers.get(item.appClientUser)!;
        existingItem.events?.push(item.subscribedEvent);
        existingItem.secret = '';
      }
    }

    return Array.from(subscribers.values()) // return the consolidated PubSubCollection object
      .map(item => ({...item,

        // map in the flags for the ag-grid to show on the UI..
        personChange: item.events?.includes(SubscriberDtoSubscribedEventEnum.PersonChange),
        personDelete: item.events?.includes(SubscriberDtoSubscribedEventEnum.PersonDelete),
        organizationChange: item.events?.includes(SubscriberDtoSubscribedEventEnum.OrganizationChange),
        organizationDelete: item.events?.includes(SubscriberDtoSubscribedEventEnum.OrganizationDelete),
        personOrgAdd: item.events?.includes(SubscriberDtoSubscribedEventEnum.PersonOrgAdd),
        personOrgRemove: item.events?.includes(SubscriberDtoSubscribedEventEnum.PersonOrgRemove),
        subOrgAdd: item.events?.includes(SubscriberDtoSubscribedEventEnum.SubOrgAdd),
        subOrgRemove: item.events?.includes(SubscriberDtoSubscribedEventEnum.SubOrgRemove),
      }));
  }
}
