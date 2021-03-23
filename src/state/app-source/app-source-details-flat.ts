import { AppClientUserPrivFlat } from "./app-client-user-priv-flat";

export interface AppSourceDetailsFlat {
  id: string,
  name: string,
  appClients: Array<AppClientUserPrivFlat>
}