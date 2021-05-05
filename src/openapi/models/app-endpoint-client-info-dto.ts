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
 * @interface AppEndpointClientInfoDto
 */
export interface AppEndpointClientInfoDto {
    /**
     * 
     * @type {string}
     * @memberof AppEndpointClientInfoDto
     */
    id?: string;
    /**
     * 
     * @type {string}
     * @memberof AppEndpointClientInfoDto
     */
    appSourceName?: string;
    /**
     * 
     * @type {string}
     * @memberof AppEndpointClientInfoDto
     */
    path?: string;
    /**
     * 
     * @type {string}
     * @memberof AppEndpointClientInfoDto
     */
    requestPath?: string;
    /**
     * 
     * @type {string}
     * @memberof AppEndpointClientInfoDto
     */
    method?: AppEndpointClientInfoDtoMethodEnum;
    /**
     * 
     * @type {boolean}
     * @memberof AppEndpointClientInfoDto
     */
    deleted?: boolean;
}

/**
    * @export
    * @enum {string}
    */
export enum AppEndpointClientInfoDtoMethodEnum {
    Get = 'GET',
    Head = 'HEAD',
    Post = 'POST',
    Put = 'PUT',
    Patch = 'PATCH',
    Delete = 'DELETE',
    Options = 'OPTIONS',
    Trace = 'TRACE'
}



