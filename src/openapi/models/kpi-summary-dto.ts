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


import { UniqueVisitorSummaryDto } from './unique-visitor-summary-dto';

/**
 * 
 * @export
 * @interface KpiSummaryDto
 */
export interface KpiSummaryDto {
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
    appSourceCount?: number;
    /**
     * 
     * @type {number}
     * @memberof KpiSummaryDto
     */
    appClientToAppSourceRequestCount?: number;
    /**
     * 
     * @type {UniqueVisitorSummaryDto}
     * @memberof KpiSummaryDto
     */
    uniqueVisitorySummary?: UniqueVisitorSummaryDto;
}


