import { RoutePath } from '../../../routes';
import { MetricType } from './MetricType';

/**
 * Generates the appropriate link to view an app source's metrics
 * 
 * @param appSourceId the id of the app source
 * @param metricType the metric type to view
 * @param name the name of the metric
 * @returns the generated path containing the respective path params
 */
export function generateMetricsLink(appSourceId: string, metricType: MetricType, name: string) {
  let normalizedName = 'overview';

  if (metricType !== MetricType.APPSOURCE) {
    normalizedName = encodeUri(name);
  }

  return `${RoutePath.APP_SOURCE}/${appSourceId}/metrics/${metricType}/${normalizedName}`;
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