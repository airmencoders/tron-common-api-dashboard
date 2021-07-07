import { State } from "@hookstate/core";
import { PrivilegeControllerApiInterface } from "../../openapi/apis/privilege-controller-api";
import { PrivilegeDto } from "../../openapi/models/privilege-dto";
import { CancellableDataRequest, isDataRequestCancelError, makeCancellableDataRequestToken } from '../../utils/cancellable-data-request';
import { prepareRequestError } from '../../utils/ErrorHandling/error-handling-utils';
import { PrivilegeType } from "./privilege-type";

export default class PrivilegeService {
  constructor(private state: State<PrivilegeDto[]>, private privilegeApi: PrivilegeControllerApiInterface) { }
  fetchAndStorePrivileges(): CancellableDataRequest<PrivilegeDto[]> {
    const cancellableRequest = makeCancellableDataRequestToken(this.privilegeApi.getPrivilegesWrapped.bind(this.privilegeApi));

    const request = cancellableRequest.axiosPromise()
      .then(r => r.data?.data)
      .catch(err => {
        if (isDataRequestCancelError(err)) {
          return [];
        }

        return Promise.reject(prepareRequestError(err));
      });

    this.state.set(request);

    return {
      promise: request,
      cancelTokenSource: cancellableRequest.cancelTokenSource
    };
  }

  convertDtoToEntity(privilege: PrivilegeDto): PrivilegeDto {
    return {
      id: privilege.id,
      name: privilege.name
    };
  }

  createPrivilegeFromType(privilegeType: PrivilegeType): PrivilegeDto | undefined {
    return this.state.find(privilege => privilege.name.value === privilegeType)?.value;
  }

  createPrivilegeFromId(id: number): PrivilegeDto | undefined {
    return this.state.find(privilege => privilege.id.value === id)?.value;
  }

  createPrivilegesFromIds(ids: Array<number>): Array<PrivilegeDto> {
    const privileges: Array<PrivilegeDto> = [];

    for (const id of ids) {
      const privilege = this.createPrivilegeFromId(id);

      if (privilege)
        privileges.push(privilege);
    }

    return privileges;
  }

  getPrivilegeIdFromType(privilegeType: PrivilegeType): number | undefined {
    return this.state.find(privilege => privilege.name.value === privilegeType)?.value.id;
  }

  getPrivilegeFromType(privilegeType: PrivilegeType): PrivilegeDto | undefined {
    return this.state.find(privilege => privilege.name.value === privilegeType)?.value;
  }

  private isStateReady(): boolean {
    return !this.error && !this.isPromised;
  }

  get isPromised(): boolean {
    return this.state.promised;
  }

  get privileges(): PrivilegeDto[] {
    return !this.isStateReady() ? new Array<PrivilegeDto>() : this.state.get();
  }

  get error(): string | undefined {
    return this.state.promised ? undefined : this.state.error;
  }
}
