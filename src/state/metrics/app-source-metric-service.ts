import { State } from '@hookstate/core';
import { AxiosPromise } from 'axios';
import { AppSourceCountMetricDto, MetricsControllerApiInterface } from '../../openapi';

export default class AppSourceMetricService {
  constructor(public state: State<AppSourceCountMetricDto>, private metricsApi: MetricsControllerApiInterface) { }

  fetchAndStoreAppSourceData(id: string): Promise<AppSourceCountMetricDto> {
    const now: Date = new Date();
    const thirtyDaysAgo: Date = new Date(new Date().setDate(now.getDate() - 30));
    const response = (): AxiosPromise<AppSourceCountMetricDto> => this.metricsApi.getCountOfMetricsForAppSource(id, thirtyDaysAgo.toISOString(), now.toISOString());

    const data = new Promise<AppSourceCountMetricDto>(async (resolve, reject) => {
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

  get appSourceMetric(): AppSourceCountMetricDto {
    return !this.isStateReady() ? {} : this.state.get();
  }

  get error(): any | undefined {
    return this.state.promised ? undefined : this.state.error;
  }
}
