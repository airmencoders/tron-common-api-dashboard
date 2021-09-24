/* tslint:disable */
/* eslint-disable */
/**
 * TRON Common API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 0.0.1
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import { ServiceMetricDto } from './service-metric-dto';
import { UniqueVisitorCountDto } from './unique-visitor-count-dto';

/**
 * 
 * @export
 * @interface KpiSummaryDto
 */
export interface KpiSummaryDto {
    /**
     * 
     * @type {string}
     * @memberof KpiSummaryDto
     */
    startDate: string;
    /**
     * 
     * @type {string}
     * @memberof KpiSummaryDto
     */
    endDate: string;
    /**
     * 
     * @type {number}
     * @memberof KpiSummaryDto
     */
    averageLatencyForSuccessfulRequests?: number;
    /**
     * 
     * @type {number}
     * @memberof KpiSummaryDto
     */
    appSourceCount: number;
    /**
     * 
     * @type {number}
     * @memberof KpiSummaryDto
     */
    appClientToAppSourceRequestCount: number;
    /**
     * 
     * @type {Array<UniqueVisitorCountDto>}
     * @memberof KpiSummaryDto
     */
    uniqueVisitorCounts: Array<UniqueVisitorCountDto>;
    /**
     * 
     * @type {Array<ServiceMetricDto>}
     * @memberof KpiSummaryDto
     */
    serviceMetrics: Array<ServiceMetricDto>;
}


