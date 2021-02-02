import { AxiosResponse } from "axios";
import Config from "../configuration";
import HttpClient from "../http-client";
import { AppClient } from "./interface/app-client";

export class AppClientsApi extends HttpClient {
  private static APP_CLIENTS_ENDPOINT: string = Config.API_URL + "app-client";

  public constructor() {
    super(AppClientsApi.APP_CLIENTS_ENDPOINT);
  }

  public getAppClients(): Promise<AxiosResponse<AppClient[]>> {
    return this.instance.get<AppClient[]>("");
  }
}
