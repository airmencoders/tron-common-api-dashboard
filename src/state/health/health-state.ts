import { createState, State, useState } from '@hookstate/core';
import HealthApi from '../../api/health/health-api';
import Components from '../../api/health/interface/components';
import Health from '../../api/health/interface/health';
import HealthService from './interface/health-service';

export interface HealthState {
  error?: string,
  health?: Health
}

const healthState = createState<HealthState | undefined>(undefined);
const healthApi: HealthApi = new HealthApi();

export const wrapState = (state: State<HealthState | undefined>, healthApi: HealthApi): HealthService => {
  return ({
    fetchAndStoreHealthStatus() {
      const healthRes = () => healthApi.getHealth();

      state.set(healthRes()
        .then(response => {
          return {
            error: undefined,
            health: response.data
          };
        })
        .catch(error => {
          return {
            error: "Could not contact server. Try again at a later date",
            health: undefined
          }
        })
      );
    },
    get isPromised(): boolean {
      return state.promised;
    },
    get systemStatus(): string | undefined {
      return state.promised ? undefined : state.get()?.health?.status;
    },
    get components(): Components | undefined {
      return state.promised ? undefined : state.get()?.health?.components;
    },
    get error(): string | undefined {
      return state.promised ? undefined : state.get()?.error;
    }
  })
};

export const accessHealthState = () => wrapState(healthState, healthApi);
export const useHealthState = () => wrapState(useState(healthState), healthApi);