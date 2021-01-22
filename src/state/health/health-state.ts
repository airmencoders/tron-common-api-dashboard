import { createState, useState } from '@hookstate/core';
import HealthApi from '../../api/health/health-api';
import Components from '../../api/health/interface/components';
import Health from '../../api/health/interface/health';
import HealthService from './interface/health-service';

const healthState = createState<Health | undefined>(undefined);
const fetchData = async () => await HealthApi.getInstance().getHealth();

export function useHealthState(): HealthService {
    const state = useState(healthState);

    return ({
        fetchAndStoreHealthStatus() {
            // state.set(fetchData());

            // Emulate a longer loading state
            state.set(new Promise(resolve => {
                setTimeout(() => resolve(fetchData()), 1000)
            }))
        },
        get isPromised(): boolean {
            return state.promised;
        },
        get systemStatus(): string | undefined {
            return state.get()?.status;
        },
        get components(): Components | undefined {
            return state.get()?.components;
        }
    })
}
