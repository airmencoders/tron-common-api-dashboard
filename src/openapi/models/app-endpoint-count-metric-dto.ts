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


import { CountMetricDto } from './count-metric-dto';

/**
 * 
 * @export
 * @interface AppEndpointCountMetricDto
 */
export interface AppEndpointCountMetricDto {
    /**
     * 
     * @type {string}
     * @memberof AppEndpointCountMetricDto
     */
    id?: string;
    /**
     * 
     * @type {string}
     * @memberof AppEndpointCountMetricDto
     */
    path: string;
    /**
     * 
     * @type {string}
     * @memberof AppEndpointCountMetricDto
     */
    requestType: string;
    /**
     * 
     * @type {string}
     * @memberof AppEndpointCountMetricDto
     */
    appSource?: string;
    /**
     * 
     * @type {Array<CountMetricDto>}
     * @memberof AppEndpointCountMetricDto
     */
    appClients?: Array<CountMetricDto>;
}

