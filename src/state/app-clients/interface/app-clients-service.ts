import { State } from "@hookstate/core";
import { AppClient } from "../../../api/app-clients/interface/app-client";
import { AppClientFlat } from "../../../api/app-clients/interface/app-client-flat";

export default interface AppClientsService {
  readonly isPromised: boolean,
  readonly appClients: State<AppClientFlat[]>,
  fetchAndStoreAppClients: () => Promise<AppClientFlat[]>,
  convertAppClientsToFlat: (clients: AppClient[]) => AppClientFlat[],
  readonly error?: string
}