import { State } from '@hookstate/core';
import { DashboardUserDto } from '../../openapi/models/dashboard-user-dto';
import { DashboardUserControllerApiInterface } from '../../openapi/apis/dashboard-user-controller-api';
import { AxiosPromise } from 'axios';
import { PrivilegeType } from '../app-clients/interface/privilege-type';

export default class AuthorizedUserService {
  constructor(public state: State<DashboardUserDto | undefined>, private dashboardUserApi: DashboardUserControllerApiInterface) { }

  fetchAndStoreAuthorizedUser(): Promise<DashboardUserDto> {
    const response = (): AxiosPromise<DashboardUserDto> => this.dashboardUserApi.getSelfDashboardUser();

    const data = new Promise<DashboardUserDto>((resolve) => resolve(response().then(r => r.data)));
    this.state.set(data);

    return data;
  }

  authorizedUserHasPrivilege(privilegeType: PrivilegeType): boolean | undefined {
    if (this.isStateReady())
      return this.authorizedUser?.privileges?.find(privilege => privilege.name === privilegeType) ? true : false;
    else
      return undefined;
  }

  private isStateReady(): boolean {
    return !this.error && !this.isPromised;
  }

  get isPromised(): boolean {
    return this.state.promised;
  }

  get authorizedUser(): DashboardUserDto | undefined {
    return !this.isStateReady() ? undefined : this.state.get();
  }

  get error(): any | undefined {
    return this.state.promised ? undefined : this.state.error;
  }
}
