import Config from "../configuration";
import HttpClient from "../http-client";
import Health from "./interface/health";

class HealthApi extends HttpClient {
    private static HEALTH_ENDPOINT: string = Config.ACTUATOR_URL + "health";
    private static classInstance?: HealthApi;

    private constructor() {
        super(HealthApi.HEALTH_ENDPOINT);
    }

    public static getInstance() {
        if (!this.classInstance) {
            return new HealthApi();
        }

        return this.classInstance;
    }

    public getHealth = () => this.instance.get<Health>("");
}

export default HealthApi;