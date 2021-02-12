import { State } from "@hookstate/core";
import { AxiosPromise } from "axios";
import { PrivilegeControllerApiInterface } from "../../openapi/apis/privilege-controller-api";
import { Privilege } from "../../openapi/models";
import { PrivilegeDto } from "../../openapi/models/privilege-dto";
import { PrivilegeType } from "../app-clients/interface/privilege-type";

export default class PrivilegeService {
  constructor(private state: State<PrivilegeDto[]>, private privilegeApi: PrivilegeControllerApiInterface) { }
  fetchAndStorePrivileges(): Promise<PrivilegeDto[]> {
    const response = (): AxiosPromise<PrivilegeDto[]> => this.privilegeApi.getPrivileges();

    const data = new Promise<PrivilegeDto[]>((resolve) => resolve(response().then(r => r.data)));
    this.state.set(data);

    return data;
  }

  convertDtoToEntity(privilege: PrivilegeDto): Privilege {
    return {
      id: privilege.id,
      name: privilege.name
    };
  }

  createPrivilege(privilegeType: PrivilegeType): Privilege | undefined {
    return this.state.find(privilege => privilege.name.value === privilegeType)?.value;
  }

  private convertArrayToMap(privileges: PrivilegeDto[]): Map<string, PrivilegeDto> {
    return new Map<string, PrivilegeDto>(privileges.map((obj) => [obj.name, obj]));
  }

  get isPromised(): boolean {
    return this.state.promised;
  }

  get privileges(): State<PrivilegeDto[]> | undefined {
    return this.state.promised ? undefined : this.state;
  }

  get error(): string | undefined {
    return this.state.promised ? undefined : this.state.error;
  }
}