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



/**
 * 
 * @export
 * @interface UniqueVisitorCountDto
 */
export interface UniqueVisitorCountDto {
    /**
     * 
     * @type {string}
     * @memberof UniqueVisitorCountDto
     */
    visitorType: UniqueVisitorCountDtoVisitorTypeEnum;
    /**
     * 
     * @type {number}
     * @memberof UniqueVisitorCountDto
     */
    uniqueCount: number;
    /**
     * 
     * @type {number}
     * @memberof UniqueVisitorCountDto
     */
    requestCount: number;
}

/**
    * @export
    * @enum {string}
    */
export enum UniqueVisitorCountDtoVisitorTypeEnum {
    DashboardUser = 'DASHBOARD_USER',
    AppClient = 'APP_CLIENT'
}



