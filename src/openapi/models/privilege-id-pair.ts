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


import { Privilege } from './privilege';

/**
 * 
 * @export
 * @interface PrivilegeIdPair
 */
export interface PrivilegeIdPair {
    /**
     * 
     * @type {string}
     * @memberof PrivilegeIdPair
     */
    userPrivPairId?: string;
    /**
     * 
     * @type {Privilege}
     * @memberof PrivilegeIdPair
     */
    priv?: Privilege;
}

