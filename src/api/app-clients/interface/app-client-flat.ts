import { ClientPrivilege } from "./client-privilege";

export interface AppClientFlat extends ClientPrivilege {
  id: string;
  name: string;
  nameAsLower: string;
}
