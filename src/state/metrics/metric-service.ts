import { AppClientCountMetricDto, EndpointCountMetricDto } from "../../openapi";

export interface MetricService {
    fetchAndStoreAppSourceData(id: string, name: string, method?: RequestMethod): Promise<AppClientCountMetricDto | EndpointCountMetricDto>;
    countMetric: AppClientCountMetricDto | EndpointCountMetricDto;
    isPromised: boolean;
}


const requestMethods = ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;
export type RequestMethod = typeof requestMethods[number];

export function isRequestMethod(a: unknown): a is RequestMethod {
    return requestMethods.indexOf(a as RequestMethod) != -1;
}