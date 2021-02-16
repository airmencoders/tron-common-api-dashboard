import { ClientPrivilege } from "./app-client-privilege";

export interface AppClientFlat extends ClientPrivilege {
  id?: string;
  name: string;
}
