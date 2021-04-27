import { State } from '@hookstate/core';
import { AxiosPromise } from 'axios';
import { AppEndpointCountMetricDto, MetricsControllerApiInterface } from '../../openapi';
import { MetricService, RequestMethod } from './metric-service';

export default class AppEndpointMetricService implements MetricService {
  constructor(public state: State<AppEndpointCountMetricDto>, private metricsApi: MetricsControllerApiInterface) { }

  fetchAndStoreAppSourceData(id: string, name: string, method: RequestMethod): Promise<AppEndpointCountMetricDto> {
    const now: Date = new Date();
    const thirtyDaysAgo: Date = new Date(new Date().setDate(now.getDate() - 30));
    const response = (): AxiosPromise<AppEndpointCountMetricDto> => this.metricsApi.getCountOfMetricsForEndpoint(id, name, method, thirtyDaysAgo.toISOString(), now.toISOString());

    const data = new Promise<AppEndpointCountMetricDto>(async (resolve, reject) => {
      try {
        const result = await response();

        resolve(result.data);
      } catch (err) {
        reject(err);
      }
    });

    this.state.set(data);

    return data;
  }

  private isStateReady(): boolean {
    return !this.error && !this.isPromised;
  }

  get isPromised(): boolean {
    return this.state.promised;
  }

  get countMetric(): AppEndpointCountMetricDto {
    return !this.isStateReady() ? { path: '', requestType: '' } : this.state.get();
  }

  get error(): any | undefined {
    return this.state.promised ? undefined : this.state.error;
  }
}


