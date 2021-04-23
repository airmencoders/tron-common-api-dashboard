import { RoutePath } from '../../../routes';
import { RequestMethod } from '../../../state/metrics/metric-service';
import { MetricType } from './metric-type';

/**
 * Generates the appropriate link to view an app source's metrics
 * 
 * @param appSourceId the id of the app source
 * @param metricType the metric type to view
 * @param name the name of the metric
 * @param method request method if applicable
 * @returns the generated path containing the respective path params
 */
export function generateMetricsLink(appSourceId: string, metricType: MetricType, name = '', method: RequestMethod | undefined = undefined) {
  let normalizedName = 'overview';

  if (metricType !== MetricType.APPSOURCE) {
    normalizedName = encodeUri(name);
  }

  return `${RoutePath.APP_SOURCE}/${appSourceId}/metrics/${metricType}/${normalizedName}/${method ? method : ''}`;
}

/**
 * @param name the string to encode
 * @returns uri encoded string
 */
export function encodeUri(name: string) {
  return encodeURIComponent(name);
}

/**
 * @param name the string to decode
 * @returns uri decoded string
 */
export function decodeUri(name: string) {
  return decodeURIComponent(name);
}