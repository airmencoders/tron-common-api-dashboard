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


import { EndpointCountMetricDto } from './endpoint-count-metric-dto';

/**
 * 
 * @export
 * @interface AppClientCountMetricDto
 */
export interface AppClientCountMetricDto {
    /**
     * 
     * @type {string}
     * @memberof AppClientCountMetricDto
     */
    id?: string;
    /**
     * 
     * @type {string}
     * @memberof AppClientCountMetricDto
     */
    name?: string;
    /**
     * 
     * @type {string}
     * @memberof AppClientCountMetricDto
     */
    appSource?: string;
    /**
     * 
     * @type {Array<EndpointCountMetricDto>}
     * @memberof AppClientCountMetricDto
     */
    endpoints?: Array<EndpointCountMetricDto>;
}


