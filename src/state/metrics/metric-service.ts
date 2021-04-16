import { AppClientCountMetricDto, EndpointCountMetricDto } from "../../openapi";

export interface MetricService {
    fetchAndStoreAppSourceData(id: string, name: string): Promise<AppClientCountMetricDto | EndpointCountMetricDto>;
    countMetric: AppClientCountMetricDto | EndpointCountMetricDto;
    isPromised: boolean;
}
