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


import { AppClientUserPrivDto } from './app-client-user-priv-dto';
import { AppEndpointDto } from './app-endpoint-dto';

/**
 * 
 * @export
 * @interface AppSourceDetailsDto
 */
export interface AppSourceDetailsDto {
    /**
     * 
     * @type {string}
     * @memberof AppSourceDetailsDto
     */
    id?: string;
    /**
     * 
     * @type {string}
     * @memberof AppSourceDetailsDto
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof AppSourceDetailsDto
     */
    appSourcePath?: string;
    /**
     * 
     * @type {number}
     * @memberof AppSourceDetailsDto
     */
    endpointCount?: number;
    /**
     * 
     * @type {number}
     * @memberof AppSourceDetailsDto
     */
    clientCount?: number;
    /**
     * 
     * @type {Array<string>}
     * @memberof AppSourceDetailsDto
     */
    appSourceAdminUserEmails?: Array<string>;
    /**
     * 
     * @type {Array<AppClientUserPrivDto>}
     * @memberof AppSourceDetailsDto
     */
    appClients?: Array<AppClientUserPrivDto>;
    /**
     * 
     * @type {Array<AppEndpointDto>}
     * @memberof AppSourceDetailsDto
     */
    endpoints?: Array<AppEndpointDto>;
}


