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
export default class DashboardUserService implements DataService<DashboardUserFlat, DashboardUserDto> {

  constructor(public state: State<DashboardUserFlat[]>,
              private dashboardUserApi: DashboardUserControllerApiInterface,
              private dashboardUserDtoCache: State<Record<string, DashboardUserDto>>) { }

  fetchAndStoreData(): Promise<DashboardUserFlat[]> {
    this.dashboardUserDtoCache.set({});
    const privilegeResponse = (): Promise<PrivilegeDto[]> => accessPrivilegeState().fetchAndStorePrivileges();
    const response = (): AxiosPromise<DashboardUserDtoResponseWrapper> => this.dashboardUserApi.getAllDashboardUsersWrapped();

    const data = new Promise<DashboardUserFlat[]>(async (resolve, reject) => {
      try {
        await privilegeResponse();
        const result = await response();
        const dashboardUserDtos = result.data.data;
        // cache dashboard user map
        const cacheUpdate: Record<string, DashboardUserDto> = {};
        for(const dashUserDto of dashboardUserDtos) {
          if (dashUserDto.id != null) {
            cacheUpdate[dashUserDto.id] = dashUserDto;
          }
        }
        this.dashboardUserDtoCache.set(cacheUpdate);
        resolve(this.convertDashboardUsersToFlat(dashboardUserDtos));
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

  async sendCreate(toCreate: DashboardUserDto): Promise<DashboardUserFlat> {
    try {
      const dashboardUserResponse = await this.dashboardUserApi.addDashboardUser(toCreate);
      const dashboardUserFlat = this.convertToFlat(dashboardUserResponse.data);

      this.state[this.state.length].set(dashboardUserFlat);

      return Promise.resolve(dashboardUserFlat);
    }
    catch (error) {
      return Promise.reject(prepareDataCrudErrorResponse(error));
    }
  }

  async sendUpdate(toUpdate: DashboardUserDto): Promise<DashboardUserFlat> {
    try {
      if (toUpdate?.id == null) {
        return Promise.reject(new Error('Dashboard User to update has undefined id.'));
      }
      const dashboardUserResponse = await this.dashboardUserApi.updateDashboardUser(toUpdate.id, toUpdate);
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

      this.state.find(item => item.id.get() === toDelete.id)?.set(none);

      return Promise.resolve();
    } catch (error) {
      return Promise.reject(prepareDataCrudErrorResponse(error));
    }
  }

  convertRowDataToEditableData(rowData: DashboardUserFlat): Promise<DashboardUserDto> {
    const dashUserDto = rowData.id != null ? this.dashboardUserDtoCache.get()[rowData.id] : {} as DashboardUserDto;
    return Promise.resolve(dashUserDto);
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
