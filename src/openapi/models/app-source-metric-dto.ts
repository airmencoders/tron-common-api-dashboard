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


import { EndpointMetricDto } from './endpoint-metric-dto';

/**
 * 
 * @export
 * @interface AppSourceMetricDto
 */
export interface AppSourceMetricDto {
    /**
     * 
     * @type {string}
     * @memberof AppSourceMetricDto
     */
    id?: string;
    /**
     * 
     * @type {string}
     * @memberof AppSourceMetricDto
     */
    name?: string;
    /**
     * 
     * @type {Array<EndpointMetricDto>}
     * @memberof AppSourceMetricDto
     */
    endpoints?: Array<EndpointMetricDto>;
}

