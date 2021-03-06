import { createState, State, useState } from '@hookstate/core';
import { AxiosPromise } from 'axios';
import HealthApi from '../../api/health/health-api';
import Components from '../../api/health/interface/components';
import Health from '../../api/health/interface/health';
import HealthService from './interface/health-service';

const healthState = createState<Partial<Health>>({});
const healthControllerApi: HealthApi = new HealthApi();

export const wrapState = (state: State<Partial<Health>>, healthApi: HealthApi): HealthService => {
  return ({
    async fetchAndStoreHealthStatus(): Promise<Health> {
      const healthRes = (): AxiosPromise<Health> => healthApi.getHealth()
          .catch(e => {
            return Promise.resolve(e.response);
          });
      const data = Promise.resolve(healthRes().then(r => r.data));

      state.set(data);

      return data;
    },

    get isStateReady(): boolean {
      return !this.isPromised && !this.error;
    },

    get isPromised(): boolean {
      return state.promised;
    },

    get systemStatus(): string | undefined {
      return this.isStateReady ? state.get().status : undefined;
    },

    get components(): Components | undefined {
      return this.isStateReady ? state.get().components : undefined;
    },

    get error(): string | undefined {
      return this.isPromised ? undefined : state.error;
    }
  })
};

export const accessHealthState = (): HealthService => wrapState(healthState, healthControllerApi);
export const useHealthState = (): HealthService => wrapState(useState(healthState), healthControllerApi);
