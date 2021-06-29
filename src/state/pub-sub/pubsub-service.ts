import { none, postpone, State } from '@hookstate/core';
import { AxiosPromise } from 'axios';
import { SubscriberControllerApiInterface, SubscriberDtoResponseWrapper } from '../../openapi';
import { SubscriberDto, SubscriberDtoSubscribedEventEnum } from '../../openapi/models/subscriber-dto';
import AppClientsService from '../app-clients/app-clients-service';
import { accessAppClientsState } from '../app-clients/app-clients-state';
import { DataService } from '../data-service/data-service';

export default class PubSubService implements DataService<SubscriberDto, SubscriberDto> {

  constructor(
    public state: State<SubscriberDto[]>, 
    private pubSubApi: SubscriberControllerApiInterface) {
  }

  async fetchAndStoreData(): Promise<SubscriberDto[]> {
    try {
      await accessAppClientsState().fetchAndStoreData();
      const response = await this.pubSubApi.getAllSubscriptionsWrapped()
          .then(resp => {
            return resp.data.data;
          })
          .catch(err => []);

      this.state.set(response ?? []);
      return response ?? [];
    }
    catch (e) {
      this.state.set([]);
      return [];
    }
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
