import { Privilege } from "./privilege";

export interface AppClient {
  id: string;
  name: string;
  privileges?: (Privilege)[] | null;
}
