import { State } from "@hookstate/core";
import { AppClientFlat } from "./interface/app-client-flat";
import { ClientPrivilege } from "./interface/app-client-privilege";
import { PrivilegeType } from "./interface/privilege-type";
import { AppClientControllerApiInterface } from "../../openapi/apis/app-client-controller-api";
import { AppClientUserDto } from "../../openapi/models/app-client-user-dto";
import { AxiosPromise } from "axios";

export default class AppClientsService {
  constructor(private state: State<AppClientFlat[]>, private appClientsApi: AppClientControllerApiInterface) { }
  fetchAndStoreAppClients(): Promise<AppClientFlat[]> {
    const response = (): AxiosPromise<AppClientUserDto[]> => this.appClientsApi.getUsers();

    const data = new Promise<AppClientFlat[]>((resolve) => resolve(response().then(r => this.convertAppClientsToFlat(r.data))));
    this.state.set(data);

    return data;
  }

  convertAppClientsToFlat(clients: AppClientUserDto[]): AppClientFlat[] {
    return clients.map(client => {
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
    });
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