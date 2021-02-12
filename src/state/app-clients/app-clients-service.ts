import { State } from "@hookstate/core";
import { AppClientFlat } from "./interface/app-client-flat";
import { ClientPrivilege } from "./interface/app-client-privilege";
import { PrivilegeType } from "./interface/privilege-type";
import { AppClientControllerApiInterface } from "../../openapi/apis/app-client-controller-api";
import { AppClientUserDto } from "../../openapi/models/app-client-user-dto";
import { AxiosPromise } from "axios";
import { Privilege, PrivilegeDto } from "../../openapi/models";
import { accessPrivilegeState } from "../privilege/privilege-state";

export default class AppClientsService {
  constructor(private state: State<AppClientFlat[]>, private appClientsApi: AppClientControllerApiInterface) { }

  fetchAndStoreAppClients(): Promise<AppClientFlat[]> {
    const response = (): AxiosPromise<AppClientUserDto[]> => this.appClientsApi.getAppClientUsers();

    const data = new Promise<AppClientFlat[]>((resolve) => resolve(response().then(r => this.convertAppClientsToFlat(r.data))));
    this.state.set(data);

    return data;
  }

  sendUpdatedAppClient(client: AppClientUserDto): AxiosPromise<AppClientUserDto> {
    return this.appClientsApi.updateAppClient(client.id || "", client);
  }

  sendCreateAppClient(client: AppClientUserDto): AxiosPromise<AppClientUserDto> {
    return this.appClientsApi.createAppClientUser(client);
  }

  convertAppClientsToFlat(clients: AppClientUserDto[]): AppClientFlat[] {
    return clients.map(client => {
      return this.convertAppClientToFlat(client);
    });
  }

  convertAppClientToFlat(client: AppClientUserDto): AppClientFlat {
    const { id, name } = client;

    const privilegeArr = Array.from(client.privileges || []);

    const privileges: ClientPrivilege = {
      read: privilegeArr.find(privilege => privilege.name === PrivilegeType.READ) ? true : false,
      write: privilegeArr.find(privilege => privilege.name === PrivilegeType.WRITE) ? true : false,
    };

    return {
      id,
      name,
      ...privileges
    };
  }

  convertToDto(client: AppClientFlat): AppClientUserDto {
    return {
      id: client.id,
      name: client.name,
      privileges: this.createAppPrivilegesArr(client)
    };
  }

  createAppPrivilegesArr(client: AppClientFlat): Array<Privilege> {
    return Array.from(this.createAppPrivileges(client));
  }

  createAppPrivileges(client: AppClientFlat): Set<Privilege> {
    const privileges = new Set<Privilege>();

    if (client.read) {
      const privilege = accessPrivilegeState().createPrivilege(PrivilegeType.READ);

      if (privilege) {
        privileges.add(privilege);
      }
    }

    if (client.write) {
      const privilege = accessPrivilegeState().createPrivilege(PrivilegeType.WRITE);

      if (privilege) {
        privileges.add(privilege);
      }
    }

    return privileges;
  }

  get privileges(): PrivilegeDto[] | undefined {
    return accessPrivilegeState().privileges?.get();
  }

  get isPromised(): boolean {
    return this.state.promised;
  }

  get appClients(): State<AppClientFlat[]> | undefined {
    return this.state.promised ? undefined : this.state;
  }

  get error(): string | undefined {
    return this.state.promised ? undefined : this.state.error;
  }
}