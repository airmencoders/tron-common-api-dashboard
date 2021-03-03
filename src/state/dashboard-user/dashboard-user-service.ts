import { State } from '@hookstate/core';
import { DashboardUserDto } from '../../openapi/models/dashboard-user-dto';
import { DashboardUserControllerApiInterface } from '../../openapi/apis/dashboard-user-controller-api';
import { AxiosPromise } from 'axios';
import { DashboardUserPrivilege } from './dashboard-user-privilege';
import { DashboardUserFlat } from './dashboard-user-flat';
import { PrivilegeType } from '../app-clients/interface/privilege-type';
import { DataService } from '../data-service/data-service';
import { Privilege } from '../../openapi';
import { accessPrivilegeState } from '../privilege/privilege-state';

export default class DashboardUserService implements DataService<DashboardUserFlat, DashboardUserDto> {
  constructor(public state: State<DashboardUserFlat[]>, private dashboardUserApi: DashboardUserControllerApiInterface) { }

  fetchAndStoreData(): Promise<DashboardUserFlat[]> {
    const response = (): AxiosPromise<DashboardUserDto[]> => this.dashboardUserApi.getAllDashboardUsers();

    const data = new Promise<DashboardUserFlat[]>((resolve) => resolve(response().then(r => this.convertDashboardUsersToFlat(r.data))));
    this.state.set(data);

    return data;
  }

  convertDashboardUsersToFlat(users: DashboardUserDto[]): DashboardUserFlat[] {
    return users.map(user => {
      return this.convertToFlat(user);
    });
  }

  convertToFlat(user: DashboardUserDto): DashboardUserFlat {
    const { id, email } = user;

    const privilegeArr = Array.from(user.privileges || []);

    const privileges: DashboardUserPrivilege = {
      hasDashboardAdmin: privilegeArr.find(privilege => privilege.name === PrivilegeType.DASHBOARD_ADMIN) ? true : false,
      hasDashboardUser: privilegeArr.find(privilege => privilege.name === PrivilegeType.DASHBOARD_USER) ? true : false,
    };

    return {
      id,
      email: email || '',
      ...privileges
    } as DashboardUserFlat;
  }

  convertToDto(dashboardUserFlat: DashboardUserFlat): DashboardUserDto {
    return {
      id: dashboardUserFlat.id,
      email: dashboardUserFlat.email,
      privileges: this.createPrivilegesArr(dashboardUserFlat)
    };
  }

  createPrivilegesArr(dashboardUser: DashboardUserFlat): Array<Privilege> {
    return Array.from(this.createPrivileges(dashboardUser));
  }

  createPrivileges(dashboardUser: DashboardUserFlat): Set<Privilege> {
    const privileges = new Set<Privilege>();

    if (dashboardUser.hasDashboardAdmin) {
      const privilege = accessPrivilegeState().createPrivilege(PrivilegeType.DASHBOARD_ADMIN);

      if (privilege) {
        privileges.add(privilege);
      }
    }

    if (dashboardUser.hasDashboardUser) {
      const privilege = accessPrivilegeState().createPrivilege(PrivilegeType.DASHBOARD_USER);

      if (privilege) {
        privileges.add(privilege);
      }
    }

    return privileges;
  }

  async sendCreate(toCreate: DashboardUserDto): Promise<DashboardUserFlat> {
    try {
      const dashboardUserResponse = await this.dashboardUserApi.addDashboardUser(toCreate);
      return Promise.resolve(this.convertToFlat(dashboardUserResponse.data));
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  async sendUpdate(toUpdate: DashboardUserDto): Promise<DashboardUserFlat> {
    try {
      if (toUpdate?.id == null) {
        return Promise.reject(new Error('Dashboard User to update has undefined id.'));
      }
      const dsahboardUserResponse = await this.dashboardUserApi.updateDashboardUser(toUpdate.id, toUpdate);
      return Promise.resolve(this.convertToFlat(dsahboardUserResponse.data));
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  getDtoForRowData(rowData: DashboardUserFlat): Promise<DashboardUserDto> {
    return Promise.resolve(this.convertToDto(rowData));
  }

  private isStateReady(): boolean {
    return !this.error && !this.isPromised;
  }

  get isPromised(): boolean {
    return this.state.promised;
  }

  get dashboardUsers(): DashboardUserDto[] | undefined {
    return !this.isStateReady() ? new Array<DashboardUserDto>() : this.state.get();
  }

  get error(): any | undefined {
    return this.state.promised ? undefined : this.state.error;
  }
}
