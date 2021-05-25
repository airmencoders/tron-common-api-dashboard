import { none, postpone, State } from '@hookstate/core';
import { DashboardUserDto } from '../../openapi/models/dashboard-user-dto';
import { DashboardUserControllerApiInterface } from '../../openapi/apis/dashboard-user-controller-api';
import { AxiosPromise } from 'axios';
import { DashboardUserPrivilege } from './dashboard-user-privilege';
import { DashboardUserFlat } from './dashboard-user-flat';
import { PrivilegeType } from '../privilege/privilege-type';
import { DataService } from '../data-service/data-service';
import { DashboardUserDtoResponseWrapper, PrivilegeDto } from '../../openapi';
import { accessPrivilegeState } from '../privilege/privilege-state';
import { prepareDataCrudErrorResponse } from '../data-service/data-service-utils';

/**
 * PII WARNING:
 * Models used by this service has the following PII fields
 * DashboardUserFlat
 *  * email
 * DashboardUserDto
 * * email
 */
export default class DashboardUserService implements DataService<DashboardUserFlat, DashboardUserFlat> {
  constructor(public state: State<DashboardUserFlat[]>, private dashboardUserApi: DashboardUserControllerApiInterface) { }

  fetchAndStoreData(): Promise<DashboardUserFlat[]> {
    const privilegeResponse = (): Promise<PrivilegeDto[]> => accessPrivilegeState().fetchAndStorePrivileges();
    const response = (): AxiosPromise<DashboardUserDtoResponseWrapper> => this.dashboardUserApi.getAllDashboardUsersWrapped();

    const data = new Promise<DashboardUserFlat[]>(async (resolve, reject) => {
      try {
        await privilegeResponse();
        const result = await response();

        resolve(this.convertDashboardUsersToFlat(result.data.data));
      } catch (err) {
        reject(prepareDataCrudErrorResponse(err));
      }
    });

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

  createPrivilegesArr(dashboardUser: DashboardUserFlat): Array<PrivilegeDto> {
    return Array.from(this.createPrivileges(dashboardUser));
  }

  createPrivileges(dashboardUser: DashboardUserFlat): Set<PrivilegeDto> {
    const privileges = new Set<PrivilegeDto>();

    if (dashboardUser.hasDashboardAdmin) {
      const privilege = accessPrivilegeState().createPrivilegeFromType(PrivilegeType.DASHBOARD_ADMIN);

      if (privilege) {
        privileges.add(privilege);
      }
    }

    if (dashboardUser.hasDashboardUser) {
      const privilege = accessPrivilegeState().createPrivilegeFromType(PrivilegeType.DASHBOARD_USER);

      if (privilege) {
        privileges.add(privilege);
      }
    }

    return privileges;
  }

  async sendCreate(toCreate: DashboardUserFlat): Promise<DashboardUserFlat> {
    try {
      const dashboardUserDto = this.convertToDto(toCreate);
      const dashboardUserResponse = await this.dashboardUserApi.addDashboardUser(dashboardUserDto);
      const dashboardUserFlat = this.convertToFlat(dashboardUserResponse.data);

      this.state[this.state.length].set(dashboardUserFlat);

      return Promise.resolve(dashboardUserFlat);
    }
    catch (error) {
      return Promise.reject(prepareDataCrudErrorResponse(error));
    }
  }

  async sendUpdate(toUpdate: DashboardUserFlat): Promise<DashboardUserFlat> {
    try {
      if (toUpdate?.id == null) {
        return Promise.reject(new Error('Dashboard User to update has undefined id.'));
      }
      const dashboardUserDto = this.convertToDto(toUpdate);
      const dashboardUserResponse = await this.dashboardUserApi.updateDashboardUser(toUpdate.id, dashboardUserDto);
      const dashboardUserFlat = this.convertToFlat(dashboardUserResponse.data);

      const index = this.state.get().findIndex(item => item.id === dashboardUserFlat.id);
      this.state[index].set(dashboardUserFlat);

      return Promise.resolve(dashboardUserFlat);
    }
    catch (error) {
      return Promise.reject(prepareDataCrudErrorResponse(error));
    }
  }

  async sendDelete(toDelete: DashboardUserFlat): Promise<void> {
    try {
      if (toDelete?.id == null) {
        return Promise.reject('Dashboard User to delete has undefined id.');
      }

      await this.dashboardUserApi.deleteDashboardUser(toDelete.id);

      const item = this.state.find(item => item.id.get() === toDelete.id);
      if (item)
        item.set(none);

      return Promise.resolve();
    } catch (error) {
      return Promise.reject(prepareDataCrudErrorResponse(error));
    }
  }

  convertRowDataToEditableData(rowData: DashboardUserFlat): Promise<DashboardUserFlat> {
    return Promise.resolve(rowData);
  }

  private isStateReady(): boolean {
    return !this.error && !this.isPromised;
  }

  get isPromised(): boolean {
    return this.state.promised;
  }

  get dashboardUsers(): DashboardUserDto[] {
    return !this.isStateReady() ? new Array<DashboardUserDto>() : this.state.get();
  }

  get error(): any | undefined {
    return this.state.promised ? undefined : this.state.error;
  }

  resetState() {
    this.state.batch((state) => {
      if (state.promised) {
        return postpone;
      }

      this.state.set([]);
    });
  }
}
