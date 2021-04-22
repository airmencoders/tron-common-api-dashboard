import { AppClientCountMetricDto, EndpointCountMetricDto } from "../../openapi";

export interface MetricService {
    fetchAndStoreAppSourceData(id: string, name: string, method?: RequestMethod): Promise<AppClientCountMetricDto | EndpointCountMetricDto>;
    countMetric: AppClientCountMetricDto | EndpointCountMetricDto;
    isPromised: boolean;
}


const RequestMethod = ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;
export type RequestMethod = typeof RequestMethod[number];

export function isRequestMethod(a: unknown): a is RequestMethod {
    return RequestMethod.indexOf(a as RequestMethod) != -1;
}