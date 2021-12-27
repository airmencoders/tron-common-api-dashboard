import { none, State } from '@hookstate/core';
import { DashboardUserDto } from '../../openapi/models/dashboard-user-dto';
import { DashboardUserControllerApiInterface } from '../../openapi/apis/dashboard-user-controller-api';
import { DashboardUserPrivilege } from './dashboard-user-privilege';
import { DashboardUserFlat } from './dashboard-user-flat';
import { PrivilegeType } from '../privilege/privilege-type';
import { DataService } from '../data-service/data-service';
import { PrivilegeDto } from '../../openapi';
import { accessPrivilegeState } from '../privilege/privilege-state';
import { prepareDataCrudErrorResponse } from '../data-service/data-service-utils';
import { CancellableDataRequest, isDataRequestCancelError, makeCancellableDataRequest } from '../../utils/cancellable-data-request';
import { AxiosError } from 'axios';

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

  fetchAndStoreData(): CancellableDataRequest<DashboardUserFlat[]> {
    this.dashboardUserDtoCache.set({});
    const privilegeRequest = accessPrivilegeState().fetchAndStorePrivileges();
    const response = makeCancellableDataRequest(privilegeRequest.cancelTokenSource, this.dashboardUserApi.getAllDashboardUsersWrapped.bind(this.dashboardUserApi));

    const data = new Promise<DashboardUserFlat[]>(async (resolve, reject) => {
      try {
        await privilegeRequest.promise;
        const result = await response.axiosPromise();
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
      } catch (error) {
        if (isDataRequestCancelError(error)) {
          return [];
        }

        reject(prepareDataCrudErrorResponse(error));
      }
    });

    this.state.set(data);

    return {
      promise: data,
      cancelTokenSource: response.cancelTokenSource
    };
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
    return privileges;
  }

  async sendCreate(toCreate: DashboardUserDto): Promise<DashboardUserFlat> {
    try {
      const dashboardUserResponse = await this.dashboardUserApi.addDashboardUser(toCreate);
      const newDashboardUser = dashboardUserResponse.data;
      const dashboardUserFlat = this.convertToFlat(newDashboardUser);

      this.state[this.state.length].set(dashboardUserFlat);

      if (newDashboardUser.id) {
        this.dashboardUserDtoCache.merge({
          [newDashboardUser.id]: newDashboardUser
        });
      }

      return Promise.resolve(dashboardUserFlat);
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
      const dashboardUserResponse = await this.dashboardUserApi.updateDashboardUser(toUpdate.id, toUpdate);
      const updatedDashboardUser = dashboardUserResponse.data;
      const dashboardUserFlat = this.convertToFlat(updatedDashboardUser);

      const index = this.state.get().findIndex(item => item.id === dashboardUserFlat.id);
      this.state[index].set(dashboardUserFlat);

      if (updatedDashboardUser.id) {
        this.dashboardUserDtoCache.merge({
          [updatedDashboardUser.id]: updatedDashboardUser
        });
      }

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

      this.dashboardUserDtoCache[toDelete.id].set(none);

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

  get dashboardUsers(): DashboardUserFlat[] {
    return !this.isStateReady() ? [] : this.state.get();
  }

  get error(): any | undefined {
    return this.state.promised ? undefined : this.state.error;
  }

  resetState() {
    if (!this.state.promised) {
      this.state.set([]);
    }

    if (!this.dashboardUserDtoCache.promised) {
      this.dashboardUserDtoCache.set({});
    }
  }
}
