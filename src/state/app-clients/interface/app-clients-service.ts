import { AppClient } from "../../../api/app-clients/interface/app-client";
import { AppClientFlat } from "../../../api/app-clients/interface/app-client-flat";

export default interface AppClientsService {
  readonly isPromised: boolean,
  readonly appClients?: AppClient[],
  fetchAndStoreAppClients: () => void,
  convertAppClientsToFlat: (clients: AppClient[]) => AppClientFlat[],
  readonly error?: string
}