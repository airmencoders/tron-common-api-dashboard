import { State } from '@hookstate/core';
import { DashboardUserDto } from '../../openapi/models/dashboard-user-dto';
import { DashboardUserControllerApiInterface } from '../../openapi/apis/dashboard-user-controller-api';
import { AxiosPromise } from 'axios';

export default class DashboardUserService {
  constructor(private state: State<DashboardUserDto | undefined>, private dashboardUserApi: DashboardUserControllerApiInterface) { }

  fetchAndStoreDashboardUser(): Promise<DashboardUserDto> {
    const response = (): AxiosPromise<DashboardUserDto> => this.dashboardUserApi.getSelfDashboardUser();

    const data = new Promise<DashboardUserDto>((resolve) => resolve(response().then(r => r.data)));
    this.state.set(data);

    return data;
  }

  get isPromised(): boolean {
    return this.state.promised;
  }

  get dashboardUser(): DashboardUserDto | undefined {
    return this.state.promised || this.state.error ? undefined : this.state.get();
  }

  get error(): any | undefined {
    return this.state.promised ? undefined : this.state.error;
  }
}
