import { State } from "@hookstate/core";
import { AxiosPromise } from "axios";
import { PrivilegeDtoResponseWrapper } from '../../openapi';
import { PrivilegeControllerApiInterface } from "../../openapi/apis/privilege-controller-api";
import { PrivilegeDto } from "../../openapi/models/privilege-dto";
import { PrivilegeType } from "./privilege-type";

export default class PrivilegeService {
  constructor(private state: State<PrivilegeDto[]>, private privilegeApi: PrivilegeControllerApiInterface) { }
  fetchAndStorePrivileges(): Promise<PrivilegeDto[]> {
    const response = (): AxiosPromise<PrivilegeDtoResponseWrapper> => this.privilegeApi.getPrivilegesWrapped();

    const data = new Promise<PrivilegeDto[]>((resolve) => resolve(response().then(r => r.data.data)));
    this.state.set(data);

    return data;
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