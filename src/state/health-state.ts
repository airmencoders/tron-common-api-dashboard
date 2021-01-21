import { createState, useState } from '@hookstate/core';
import HealthApi, { Health } from '../api/health-api';

const healthState = createState<Health | null>(null);

const fetchData = async () => await HealthApi.getInstance().getHealth();

export function useHealthState() {
    const state = useState(healthState);

    return ({
        fetchAndStoreHealthStatus() {
            // state.set(fetchData());

            // Emulate a longer loading state
            state.set(new Promise(resolve => {
                setTimeout(() => resolve(fetchData()), 1000)
            }))
        },
        get isPromised() {
            return state.promised;
        },
        get systemStatus() {
            return state.get()?.status;
        },
        get components() {
            return state.get()?.components;
        }
    })
}