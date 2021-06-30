import { AxiosResponse } from "axios";
import Config from "../config";
import HttpClient from "../http-client";
import Health from "./interface/health";

class HealthApi extends HttpClient {
    private static HEALTH_ENDPOINT: string = Config.ACTUATOR_URL + "health";

    public constructor() {
        super(HealthApi.HEALTH_ENDPOINT);
    }

    public getHealth(): Promise<AxiosResponse<Health>> {
        return this.instance.get<Health>("");
    }
}

export default HealthApi;
