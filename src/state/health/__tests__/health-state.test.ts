import { createState, StateMethods } from "@hookstate/core";
import HealthApi from "../../../api/health/health-api";
import Health from "../../../api/health/interface/health";
import { accessHealthState, wrapState, HealthState } from "../health-state";
import { AxiosResponse } from 'axios';
import HealthService from "../interface/health-service";

jest.mock('../../../api/health/health-api', () => jest.fn());

describe('Test HealthState', () => {
  const response = { "status": "UP", "components": { "db": { "status": "UP", "details": { "database": "H2", "validationQuery": "isValid()" } }, "diskSpace": { "status": "UP", "details": { "total": 119501303808, "free": 6275170304, "threshold": 10485760, "exists": true } }, "ping": { "status": "UP" } } };

  const axiosRes: AxiosResponse = {
    data: response,
    status: 200,
    statusText: 'OK',
    config: {},
    headers: {}
  };

  let healthState: StateMethods<HealthState | undefined>;
  let healthApi: HealthApi;
  let state: HealthService;

  beforeEach(() => {
    healthState = createState<HealthState | undefined>(undefined);
    healthApi = new HealthApi();

    healthApi.getHealth = jest.fn(() => {
      return new Promise<AxiosResponse<Health>>(resolve => {
        setTimeout(() => resolve(axiosRes), 1000);
      });
    });

    state = wrapState(healthState, healthApi);
  });

  it('isPromised', () => {
    expect(state.isPromised).toBe(false);

    state.fetchAndStoreHealthStatus();

    expect(state.isPromised).toBe(true);
  });

  it('systemStatus (not promised)', async () => {
    healthApi.getHealth = jest.fn(() => {
      return new Promise<AxiosResponse<Health>>(resolve => resolve(axiosRes));
    });

    state.fetchAndStoreHealthStatus();

    // wait for pending promises are resolved, specifically to get health
    const flushPromises = () => new Promise(setImmediate);
    await flushPromises();

    expect(state.systemStatus).toEqual(response.status);
  });

  it('systemStatus (promised)', async () => {
    state.fetchAndStoreHealthStatus();

    expect(state.systemStatus).toEqual(undefined);
  });

  it('components (not promised)', async () => {
    healthApi.getHealth = jest.fn(() => {
      return new Promise<AxiosResponse<Health>>(resolve => resolve(axiosRes));
    });

    state.fetchAndStoreHealthStatus();

    // wait for pending promises are resolved, specifically to get health
    const flushPromises = () => new Promise(setImmediate);
    await flushPromises();

    expect(state.components).toEqual(response.components);
  });

  it('components (promised)', () => {
    state.fetchAndStoreHealthStatus();

    expect(state.components).toEqual(undefined);
  });

  // Nothing to really test here
  it('accessHealthState', () => {
    const access = accessHealthState();

    expect(access).toBeDefined();
  });
});

