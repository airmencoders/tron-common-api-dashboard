import { Privilege } from "./privilege";

export interface AppClient {
  id: string;
  name: string;
  nameAsLower: string;
  privileges?: (Privilege)[] | null;
}
