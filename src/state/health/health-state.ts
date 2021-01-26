import { createState, State, useState } from '@hookstate/core';
import HealthApi from '../../api/health/health-api';
import Components from '../../api/health/interface/components';
import Health from '../../api/health/interface/health';
import HealthService from './interface/health-service';

export const healthState = createState<Health | undefined>(undefined);
export const healthApi: HealthApi = new HealthApi();

export const wrapState = (state: State<Health | undefined>, healthApi: HealthApi): HealthService => {
    return ({
        fetchAndStoreHealthStatus() {
            const healthRes = () => healthApi.getHealth();

            state.set(healthRes().then(response => response.data));
        },
        get isPromised(): boolean {
            return state.promised;
        },
        get systemStatus(): string | undefined {
            return state.promised ? undefined : state.get()?.status;
        },
        get components(): Components | undefined {
            return state.promised ? undefined : state.get()?.components;
        }
    })
}

export const accessHealthState = () => wrapState(healthState, healthApi)
export const useHealthState = () => wrapState(useState(healthState), healthApi)