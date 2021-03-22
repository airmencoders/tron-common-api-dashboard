import { AppClientPrivilege } from "../app-clients/app-client-privilege";

export interface AppClientUserPrivFlat extends AppClientPrivilege {
  appClientUser: string;
  appClientUserName: string;
}
