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


import { MeterValueDto } from './meter-value-dto';

/**
 * 
 * @export
 * @interface EndpointMetricDto
 */
export interface EndpointMetricDto {
    /**
     * 
     * @type {string}
     * @memberof EndpointMetricDto
     */
    id?: string;
    /**
     * 
     * @type {string}
     * @memberof EndpointMetricDto
     */
    path: string;
    /**
     * 
     * @type {string}
     * @memberof EndpointMetricDto
     */
    requestType: string;
    /**
     * 
     * @type {Array<MeterValueDto>}
     * @memberof EndpointMetricDto
     */
    values?: Array<MeterValueDto>;
}

