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


import { AppEndpointClientInfoDto } from './app-endpoint-client-info-dto';
import { Privilege } from './privilege';

/**
 * 
 * @export
 * @interface AppClientUserDetailsDto
 */
export interface AppClientUserDetailsDto {
    /**
     * 
     * @type {string}
     * @memberof AppClientUserDetailsDto
     */
    id?: string;
    /**
     * 
     * @type {Array<Privilege>}
     * @memberof AppClientUserDetailsDto
     */
    privileges?: Array<Privilege>;
    /**
     * 
     * @type {string}
     * @memberof AppClientUserDetailsDto
     */
    name?: string;
    /**
     * 
     * @type {Array<string>}
     * @memberof AppClientUserDetailsDto
     */
    appClientDeveloperEmails?: Array<string>;
    /**
     * 
     * @type {Array<AppEndpointClientInfoDto>}
     * @memberof AppClientUserDetailsDto
     */
    appEndpointPrivs?: Array<AppEndpointClientInfoDto>;
}


