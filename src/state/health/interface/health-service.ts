import Components from "../../../api/health/interface/components";
import Health from "../../../api/health/interface/health";

export default interface HealthService {
  readonly isPromised: boolean;
  readonly systemStatus?: string;
  readonly components?: Components;
  fetchAndStoreHealthStatus: () => Promise<Health>;
  readonly error?: string;
  readonly isStateReady: boolean;
}