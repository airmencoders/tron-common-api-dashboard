import { State } from '@hookstate/core';
import { AxiosPromise } from 'axios';
import { EndpointCountMetricDto, MetricsControllerApiInterface } from '../../openapi';
import { MetricService } from './metric-service';

export default class AppEndpointMetricService implements MetricService {
  constructor(public state: State<EndpointCountMetricDto>, private metricsApi: MetricsControllerApiInterface) { }

  fetchAndStoreAppSourceData(id: string, name: string): Promise<EndpointCountMetricDto> {
    const now: Date = new Date();
    const thirtyDaysAgo: Date = new Date(new Date().setDate(now.getDate() - 30));
    const response = (): AxiosPromise<EndpointCountMetricDto> => this.metricsApi.getCountOfMetricsForEndpoint(id, name, thirtyDaysAgo.toISOString(), now.toISOString());

    const data = new Promise<EndpointCountMetricDto>(async (resolve, reject) => {
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

  get countMetric(): EndpointCountMetricDto {
    return !this.isStateReady() ? {} : this.state.get();
  }

  get error(): any | undefined {
    return this.state.promised ? undefined : this.state.error;
  }
}
