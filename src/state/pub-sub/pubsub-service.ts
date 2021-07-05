import { none, postpone, State } from '@hookstate/core';
import { SubscriberControllerApiInterface } from '../../openapi';
import { SubscriberDto } from '../../openapi/models/subscriber-dto';
import { CancellableDataRequest, makeCancellableDataRequestToken } from '../../utils/cancellable-data-request';
import { DataService } from '../data-service/data-service';
import { wrapDataCrudWrappedRequest } from '../data-service/data-service-utils';

export default class PubSubService implements DataService<SubscriberDto, SubscriberDto> {

  constructor(
    public state: State<SubscriberDto[]>, 
    private pubSubApi: SubscriberControllerApiInterface) {
  }

  fetchAndStoreData(): CancellableDataRequest<SubscriberDto[]> {
    const cancellableRequest = makeCancellableDataRequestToken(this.pubSubApi.getAllSubscriptionsWrapped.bind(this.pubSubApi));
    const requestPromise = wrapDataCrudWrappedRequest(cancellableRequest.axiosPromise());

    this.state.set(requestPromise);

    return {
      promise: requestPromise,
      cancelTokenSource: cancellableRequest.cancelTokenSource
    };
  }

  convertRowDataToEditableData(rowData: SubscriberDto): Promise<SubscriberDto> {
    return Promise.resolve(rowData);
  }  

  async sendUpdate(toUpdate: SubscriberDto): Promise<SubscriberDto> {
    try {
      if (!toUpdate.id) {
        return Promise.reject(new Error('Subscriber to update has undefined id.'));
      }
      const updatedResponse = await this.pubSubApi.createSubscription(toUpdate as SubscriberDto);
      const currentIndex = this.state.get().findIndex(sub => sub.id === updatedResponse.data.id);
      if (currentIndex) {
        this.state[currentIndex].set(updatedResponse.data);
      }
      return Promise.resolve(updatedResponse.data);
    }
    catch (error) {
      return Promise.reject(error);
    }
  } 

  async sendCreate(toCreate: SubscriberDto): Promise<SubscriberDto> {
    try {
      const subscriberResponse = await this.pubSubApi.createSubscription(toCreate);
      const subscriberDto = subscriberResponse.data as SubscriberDto;
      const currentIndex = this.state.get().findIndex(sub => 
              (sub.id === subscriberResponse.data.id && sub.subscribedEvent === subscriberResponse.data.subscribedEvent));

      if (currentIndex !== -1) {
        this.state[currentIndex].set(subscriberResponse.data);
      }
      else {
        this.state[this.state.length].set(subscriberDto);
      }
      return Promise.resolve(subscriberDto);
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  async sendDelete(toDelete: SubscriberDto): Promise<void> {
    try {
      if (toDelete?.id == null) {
        return Promise.reject('Subscription to delete has undefined id.');
      }

      await this.pubSubApi.cancelSubscription(toDelete.id);
      this.state.find(item => item.id.get() === toDelete.id)?.set(none);

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
    this.state.batch((state) => {
      if (state.promised) {
        return postpone;
      }

      this.state.set([]);
    });
  }
}
