import Components from "../../../api/health/interface/components";

export default interface HealthService {
    readonly isPromised: boolean,
    readonly systemStatus?: string,
    readonly components?: Components,
    fetchAndStoreHealthStatus: () => void,
    readonly error?: string
}