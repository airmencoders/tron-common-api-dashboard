import Config from "./configuration";
import HttpClient from "./http-client";

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

export interface Health {
    status: string;
    components: Components;
}

interface Components {
    db: Db;
    diskSpace: DiskSpace;
    ping: Ping;
}

interface Db {
    status: string;
    details: DbDetails;
}

interface DbDetails {
    database: string;
    validationQuery: string;
}

interface DiskSpace {
    status: string;
    details: DiskSpaceDetails;
}

interface DiskSpaceDetails {
    total: number;
    free: number;
    threshold: number;
    exists: boolean;
}

interface Ping {
    status: string;
}

export default HealthApi;