import { State } from '@hookstate/core';
import { DashboardUserDto } from '../../openapi/models/dashboard-user-dto';
import { DashboardUserControllerApiInterface } from '../../openapi/apis/dashboard-user-controller-api';
import { AxiosPromise } from 'axios';
import { PrivilegeType } from '../privilege/privilege-type';

/**
 * PII WARNING:
 * Models used by this service has the following PII fields
 * DashboardUserDto
 *  * email
 */
export default class AuthorizedUserService {
  constructor(public state: State<DashboardUserDto | undefined>, private dashboardUserApi: DashboardUserControllerApiInterface) { }

  fetchAndStoreAuthorizedUser(): Promise<DashboardUserDto> {
    const response = (): AxiosPromise<DashboardUserDto> => this.dashboardUserApi.getSelfDashboardUser();

    const data = Promise.resolve(response().then(r => r.data));
    this.state.set(data);

    return data;
  }

  /**
   * Checks if the user has a specific privilege
   *
   * @param privilegeType the privilege type to check against the authorized user's privileges
   * @returns true if the user has the privilege, false if authorized user not yet retrieved or user does not have the privilege
   */
  authorizedUserHasPrivilege(privilegeType: PrivilegeType): boolean {
    if (this.isStateReady())
      return this.authorizedUser?.privileges?.find(privilege => privilege.name === privilegeType) ? true : false;

    return false;
  }

  /**
   * Checks if the user has any privilege
   *
   * @param privilegeTypes the privilege types to check against the authorized user's privileges
   * @returns true if the user has any of the provided privileges, false if authorized user not yet retrieved or user does not have any privilege
   */
  authorizedUserHasAnyPrivilege(privilegeTypes: PrivilegeType[]): boolean {
    if (this.isStateReady()) {
      for (const privilegeType of privilegeTypes) {
        if (this.authorizedUserHasPrivilege(privilegeType))
          return true;
      }
    }

    return false;
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

  setDocumentSpaceDefaultId(spaceId: string) {
    if(!!this.authorizedUser){
      this.state.merge({defaultDocumentSpaceId: spaceId})
    }
  }
}
