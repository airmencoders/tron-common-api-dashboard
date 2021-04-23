import { RequestMethod } from "../../../state/metrics/metric-service";

export interface MetricPageProps {
  id: string;
  type: string;
  name: string;
  method: RequestMethod | undefined;
}